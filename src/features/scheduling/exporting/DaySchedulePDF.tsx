import { Document, Page } from "@react-pdf/renderer";
import {
  AdminAttendee,
  CamperAttendee,
  Freeplay,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import { ProgramArea, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import CamperGrid from "@/features/scheduling/exporting/CamperGrid";
import BlockRatiosGrid from "@/features/scheduling/exporting/BlockRatiosGrid";
import EmployeeGrid from "@/features/scheduling/exporting/EmployeeGrid";
import ProgramAreaGrid from "@/features/scheduling/exporting/ProgramAreaGrid";
import { isBundleSectionSchedule } from "@/types/scheduling/schedulingTypeGuards";

interface DaySchedulePDFProps {
  schedule: SectionSchedule;
  freeplay: Freeplay;
  campers: CamperAttendee[];
  staff: StaffAttendee[];
  admins: AdminAttendee[];
  programAreas?: ProgramArea[];
  sectionName: string;
}

export default function DaySchedulePDF(props: DaySchedulePDFProps) {
  const { schedule, freeplay, campers, staff, admins, sectionName, programAreas } = props;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ padding: 15 }}>
        <CamperGrid
          schedule={schedule}
          freeplay={freeplay}
          campers={campers}
          staff={staff}
        />
      </Page>
      <Page size="A4" orientation="landscape" style={{ padding: 15 }}>
        <BlockRatiosGrid
          schedule={schedule}
          campers={campers}
          staff={staff}
          admins={admins}
        />
      </Page>
      <Page size="A4" orientation="landscape" style={{ padding: 15 }}>
        <EmployeeGrid
          schedule={schedule}
          freeplay={freeplay}
          campers={campers}
          employees={staff}
        />
      </Page>
      {admins.length > 0 && (
        <Page size="A4" orientation="landscape" style={{ padding: 15 }}>
          <EmployeeGrid
            schedule={schedule}
            freeplay={freeplay}
            campers={campers}
            employees={admins}
          />
        </Page>
      )}
      {isBundleSectionSchedule(schedule) && programAreas && (
        <Page size="A4" orientation="landscape" style={{ padding: 15 }}>
          <ProgramAreaGrid
            schedule={schedule}
            sectionName={sectionName}
            programAreas={programAreas}
          />
        </Page>
      )}
    </Document>
  );
}
