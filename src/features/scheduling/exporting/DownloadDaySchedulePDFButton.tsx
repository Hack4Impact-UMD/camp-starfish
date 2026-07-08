import { PDFDownloadLink } from "@react-pdf/renderer";
import DaySchedulePDF from "./DaySchedulePDF";
import useListAttendees from "@/hooks/attendees/useListAttendees";
import useSection from "@/hooks/sections/useSection";
import useFreeplay from "@/hooks/freeplays/useFreeplay";
import { cloneElement, useMemo } from "react";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import { Attendee, Freeplay, Section } from "@/types/sessions/sessionTypes";
import {
  ProgramArea,
  SectionSchedule,
} from "@/types/scheduling/schedulingTypes";
import { Button } from "@mantine/core";
import useNotifications from "@/features/notifications/useNotifications";
import { MdOpenInNew } from "react-icons/md";
import { isBundleSectionSchedule } from "@/types/scheduling/schedulingTypeGuards";
import { getAttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";
import useProgramAreas from "@/hooks/programAreas/useProgramAreas";
import { Moment } from "moment";

const baseExportButton = <Button rightSection={<MdOpenInNew />}>EXPORT</Button>;

interface DownloadDaySchedulePDFButtonProps {
  sessionId: string;
  sectionId: string;
  date: Moment;
}

export default function DownloadDaySchedulePDFButton(
  props: DownloadDaySchedulePDFButtonProps,
) {
  const { sessionId, sectionId, date } = props;

  const attendeesQuery = useListAttendees(sessionId);
  const sectionQuery = useSection(sessionId, sectionId);
  const scheduleQuery = useSectionSchedule(sessionId, sectionId);
  const freeplayQuery = useFreeplay(sessionId, date);

  const programAreasQuery = useProgramAreas();

  const programAreas = useMemo(() => {
    if (
      !scheduleQuery.data ||
      !isBundleSectionSchedule(scheduleQuery.data) ||
      !programAreasQuery.data
    )
      return undefined;
    const referencedIds = new Set<string>();
    Object.values(scheduleQuery.data.blocks).forEach((block) =>
      block.activities.forEach((activity) =>
        referencedIds.add(activity.programAreaId),
      ),
    );
    // An activity's programAreaId is a programAreas doc id in generated
    // schedules, but the activities editor stores the area's *name* there —
    // resolve either way. The result keeps the referenced string as its `id`
    // so ProgramAreaGrid can match activities back to their column, and
    // unresolvable references degrade to a name-only column instead of
    // crashing the PDF render.
    return Array.from(referencedIds).map((ref) => {
      const area =
        programAreasQuery.data.find((a) => a.id === ref) ??
        programAreasQuery.data.find((a) => a.name === ref);
      return {
        id: ref,
        name: area?.name ?? ref,
        isDeleted: area?.isDeleted ?? false,
        ageGroups: area?.ageGroups ?? [],
      };
    });
  }, [scheduleQuery.data, programAreasQuery.data]);

  const notifications = useNotifications();

  if (
    attendeesQuery.status === "error" ||
    freeplayQuery.status === "error" ||
    sectionQuery.status === "error" ||
    scheduleQuery.status === "error" ||
    programAreasQuery.status === "error"
  ) {
    return cloneElement(baseExportButton, {
      onClick: () =>
        notifications.error("Failed to generate PDF. Please try again later."),
    });
  } else if (
    attendeesQuery.status === "pending" ||
    freeplayQuery.status === "pending" ||
    sectionQuery.status === "pending" ||
    scheduleQuery.status === "pending" ||
    (scheduleQuery.data != null &&
      isBundleSectionSchedule(scheduleQuery.data) &&
      programAreasQuery.status === "pending")
  ) {
    return cloneElement(baseExportButton, { loading: true });
  } else if (scheduleQuery.data == null) {
    return cloneElement(baseExportButton, {
      onClick: () =>
        notifications.error("Failed to generate PDF. Please try again later."),
    });
  }
  return (
    <DownloadDaySchedulePDFButtonContent
      attendees={attendeesQuery.data}
      section={sectionQuery.data}
      schedule={scheduleQuery.data}
      freeplay={freeplayQuery.data}
      programAreas={programAreas}
    />
  );
}

interface DownloadDaySchedulePDFButtonContentProps {
  attendees: Attendee[];
  section: Section;
  schedule: SectionSchedule;
  freeplay: Freeplay;
  programAreas?: ProgramArea[];
}

function DownloadDaySchedulePDFButtonContent(
  props: DownloadDaySchedulePDFButtonContentProps,
) {
  const { attendees, section, schedule, freeplay, programAreas } = props;

  const { admins, staff, campers } = useMemo(
    () => getAttendeeGroups(attendees),
    [attendees],
  );

  return (
    <PDFDownloadLink
      document={
        <DaySchedulePDF
          admins={admins}
          campers={campers}
          freeplay={freeplay}
          schedule={schedule}
          sectionName={section.name}
          staff={staff}
          programAreas={programAreas}
        />
      }
      fileName={`${section.name}.pdf`}
    >
      {baseExportButton}
    </PDFDownloadLink>
  );
}
