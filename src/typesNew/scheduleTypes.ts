import { AgeGroup, SchedulingSectionType } from "./sessionTypes";

interface BaseSectionSchedule {
  sessionId: string;
  sectionId: string;
  type: SchedulingSectionType;
  blocks: { [blockId: string]: Block };
  alternatePeriodsOff: { [periodId: string]: number[] };
}

interface BaseBlock {
  activities: ActivityWithAssignments[];
  periodsOff: number[];
}
interface BundleBlock extends BaseBlock { activities: BundleActivityWithAssignments[]; }
interface BunkJamboreeBlock extends BaseBlock { activities: BunkJamboreeActivityWithAssignments[]; }
interface NonBunkJamboreeBlock extends BaseBlock { activities: NonBunkJamboreeActivityWithAssignments[]; }
type Block = BundleBlock | BunkJamboreeBlock | NonBunkJamboreeBlock;

interface BundleActivityWithAssignments {
  activity: BundleActivity;
  aassignments: IndividualActivityAssignments;
}
interface BunkJamboreeActivityWithAssignments {
  activity: JamboreeActivity;
  assignments: BunkActivityAssignments;
}
interface NonBunkJamboreeActivityWithAssignments {
  activity: JamboreeActivity;
  assignments: IndividualActivityAssignments;
}
type ActivityWithAssignments = BundleActivityWithAssignments | BunkJamboreeActivityWithAssignments | NonBunkJamboreeActivityWithAssignments;

interface BaseActivity {
  name: string;
  description: string;
}
type JamboreeActivity = BaseActivity;
interface BundleActivity extends BaseActivity {
  programAreaId: string;
  ageGroup: AgeGroup;
}
interface ProgramArea {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
}
type Activity = BundleActivity | JamboreeActivity;

interface IndividualActivityAssignments {
  camperIds: number[];
  staffIds: number[];
  adminIds: number[];
}
interface BunkActivityAssignments {
  bunkNums: number[];
  adminIds: number[];
}
type ActivityAssignments = IndividualActivityAssignments | BunkActivityAssignments;