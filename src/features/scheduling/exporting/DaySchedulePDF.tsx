import { Document, Page } from "@react-pdf/renderer";
import {
  AdminAttendeeID,
  CamperAttendeeID,
  Freeplay,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
} from "@/types/sessionTypes";
import CamperGrid from "@/features/scheduling/exporting/CamperGrid";
import BlockRatiosGrid from "@/features/scheduling/exporting/BlockRatiosGrid";
import EmployeeGrid from "@/features/scheduling/exporting/EmployeeGrid";
import ProgramAreaGrid from "@/features/scheduling/exporting/ProgramAreaGrid";

interface DaySchedulePDFProps {
  schedule: SectionScheduleID<SchedulingSectionType>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
  sectionName: string;
}

export default function DaySchedulePDF(props: DaySchedulePDFProps) {
  const { schedule, freeplay, campers, staff, admins, sectionName } = props;

  return (
    <Document>
      <Page size="A4">
        <CamperGrid
          schedule={schedule}
          freeplay={freeplay}
          campers={campers}
          staff={staff}
        />
        <BlockRatiosGrid
          schedule={schedule}
          campers={campers}
          staff={staff}
          admins={admins}
        />
        <EmployeeGrid
          schedule={schedule}
          freeplay={freeplay}
          campers={campers}
          employees={staff}
        />
        <ProgramAreaGrid schedule={schedule} sectionName={sectionName} />
      </Page>
    </Document>
  );
}
