import { Document, Page } from "@react-pdf/renderer";
import {
  AdminAttendeeID,
  AgeGroup,
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

interface CombinedPDFProps {
  schedule: SectionScheduleID<SchedulingSectionType>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
  sectionName: string;
}

export const CombinedPDF: React.FC<CombinedPDFProps> = ({
  schedule,
  freeplay,
  campers,
  staff,
  admins,
  sectionName,
}) => (
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
