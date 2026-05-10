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
import useProgramAreas from "@/hooks/programAreas/useProgramAreas";

const baseExportButton = <Button rightSection={<MdOpenInNew />}>EXPORT</Button>;

interface DownloadDaySchedulePDFButtonProps {
  sessionId: string;
  sectionId: string;
  date: string;
}

export default function DownloadDaySchedulePDFButton(
  props: DownloadDaySchedulePDFButtonProps,
) {
  const { sessionId, sectionId, date } = props;

  const attendeesQuery = useListAttendees(sessionId);
  const sectionQuery = useSection(sessionId, sectionId);
  const scheduleQuery = useSectionSchedule(sessionId, sectionId);
  const freeplayQuery = useFreeplay(sessionId, date);

  const programAreaIds = useMemo(() => {
    if (!scheduleQuery.data || !isBundleSectionSchedule(scheduleQuery.data))
      return [];
    const programAreaIds = new Set<string>();
    Object.values(scheduleQuery.data.blocks).forEach((block) =>
      block.activities.forEach((activity) =>
        programAreaIds.add(activity.programAreaId),
      ),
    );
    return Array.from(programAreaIds);
  }, [scheduleQuery.data]);
  const programAreasQuery = useProgramAreas(programAreaIds);

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
    (isBundleSectionSchedule(scheduleQuery.data) &&
      programAreasQuery.status === "pending")
  ) {
    return cloneElement(baseExportButton, { loading: true });
  }
  return (
    <DownloadDaySchedulePDFButtonContent
      attendees={attendeesQuery.data}
      section={sectionQuery.data}
      schedule={scheduleQuery.data}
      freeplay={freeplayQuery.data}
      programAreas={programAreasQuery.data}
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
    () => ({
      admins: attendees.filter((att) => att.role === "ADMIN"),
      staff: attendees.filter((att) => att.role === "STAFF"),
      campers: attendees.filter((att) => att.role === "CAMPER"),
    }),
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
