import { PDFDownloadLink } from "@react-pdf/renderer";
import DaySchedulePDF from "./DaySchedulePDF";
import useAttendeesBySessionId from "@/hooks/attendees/useAttendeesBySessionId";
import useSection from "@/hooks/sections/useSection";
import useFreeplay from "@/hooks/freeplays/useFreeplay";
import { cloneElement, useMemo } from "react";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import {
  AttendeeID,
  FreeplayID,
  SchedulingSectionType,
  SectionID,
  SectionScheduleID,
} from "@/types/sessionTypes";
import { Button } from "@mantine/core";
import useNotifications from "@/features/notifications/useNotifications";
import { MdOpenInNew } from "react-icons/md";

const baseExportButton = <Button rightSection={<MdOpenInNew />}>EXPORT</Button>;

interface DownloadDaySchedulePDFButtonProps {
  sessionId: string;
  sectionId: string;
  date: string;
}

export default function DownloadDaySchedulePDFButton(
  props: DownloadDaySchedulePDFButtonProps
) {
  const { sessionId, sectionId, date } = props;

  const attendeesQuery = useAttendeesBySessionId(sessionId);
  const sectionQuery = useSection(sessionId, sectionId);
  const scheduleQuery = useSectionSchedule(sessionId, sectionId);
  const freeplayQuery = useFreeplay(sessionId, date);

  const notifications = useNotifications();

  if (
    attendeesQuery.status === "error" ||
    freeplayQuery.status === "error" ||
    sectionQuery.status === "error" ||
    scheduleQuery.status === "error"
  ) {
    return cloneElement(baseExportButton, {
      onClick: () =>
        notifications.error("Failed to generate PDF. Please try again later."),
    });
  } else if (
    attendeesQuery.status === "pending" ||
    freeplayQuery.status === "pending" ||
    sectionQuery.status === "pending" ||
    scheduleQuery.status === "pending"
  ) {
    return cloneElement(baseExportButton, { loading: true });
  }
  return (
    <DownloadDaySchedulePDFButtonContent
      attendees={attendeesQuery.data}
      section={sectionQuery.data}
      schedule={scheduleQuery.data}
      freeplay={freeplayQuery.data}
    />
  );
}

interface DownloadDaySchedulePDFButtonContentProps {
  attendees: AttendeeID[];
  section: SectionID;
  schedule: SectionScheduleID<SchedulingSectionType>;
  freeplay: FreeplayID;
}

function DownloadDaySchedulePDFButtonContent(
  props: DownloadDaySchedulePDFButtonContentProps
) {
  const { attendees, section, schedule, freeplay } = props;

  const { admins, staff, campers } = useMemo(
    () => ({
      admins: attendees.filter((att) => att.role === "ADMIN"),
      staff: attendees.filter((att) => att.role === "STAFF"),
      campers: attendees.filter((att) => att.role === "CAMPER"),
    }),
    [attendees]
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
        />
      }
      fileName={`${section.name}.pdf`}
    >
      {baseExportButton}
    </PDFDownloadLink>
  );
}
