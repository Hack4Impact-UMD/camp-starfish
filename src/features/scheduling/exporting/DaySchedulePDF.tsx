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
import CounselorGrid from "@/features/scheduling/exporting/CounselorGrid";
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
        <CounselorGrid
          schedule={schedule}
          freeplay={freeplay}
          campers={campers}
          counselors={staff}
        />
        {isBundleSectionSchedule(schedule) && programAreas && <ProgramAreaGrid schedule={schedule} sectionName={sectionName} programAreas={programAreas} />}
      </Page>
    </Document>
  );
}
