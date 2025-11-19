import { Document, Page, View } from "@react-pdf/renderer";
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
import { ProgramAreaGrid } from "@/features/scheduling/ProgramAreaGrid";

interface CombinedPDFProps {
  schedule: SectionScheduleID<SchedulingSectionType>;
  freeplay: Freeplay;
  campers: CamperAttendeeID[];
  staff: StaffAttendeeID[];
  admins: AdminAttendeeID[];
}

export const CombinedPDF: React.FC<CombinedPDFProps> = ({
  schedule,
  freeplay,
  campers,
  staff,
  admins,
}) => (
  <Document>
    <Page size="A4">
      <View>
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
        <ProgramAreaGrid schedule={schedule} sectionName="BUNDLE" />
      </View>
    </Page>
  </Document>
);
