import { AgeGroup, SchedulingSectionType } from "../sessions/sessionTypes";

interface BaseSectionSchedule {
  sessionId: string;
  sectionId: string;
  type: SchedulingSectionType;
  blocks: { [blockId: string]: Block };
  alternatePeriodsOff: { [periodId: string]: number[] };
}
export interface BundleSectionSchedule extends BaseSectionSchedule {
  type: "BUNDLE",
  block: { [blockId: string]: BundleBlock };
}
export interface BunkJamboreeSectionSchedule extends BaseSectionSchedule {
  type: "BUNK-JAMBO",
  block: { [blockId: string]: BunkJamboreeBlock };
}
export interface NonBunkJamboreeSectionSchedule extends BaseSectionSchedule {
  type: "NON-BUNK-JAMBO",
  block: { [blockId: string]: NonBunkJamboreeBlock };
}
export type SectionSchedule = BundleSectionSchedule | BunkJamboreeSectionSchedule | NonBunkJamboreeSectionSchedule;

interface BaseBlock {
  activities: ActivityWithAssignments[];
  periodsOff: number[];
}
export interface BundleBlock extends BaseBlock { activities: BundleActivityWithAssignments[]; }
export interface BunkJamboreeBlock extends BaseBlock { activities: BunkJamboreeActivityWithAssignments[]; }
export interface NonBunkJamboreeBlock extends BaseBlock { activities: NonBunkJamboreeActivityWithAssignments[]; }
export type Block = BundleBlock | BunkJamboreeBlock | NonBunkJamboreeBlock;

export interface BundleActivityWithAssignments {
  activity: BundleActivity;
  assignments: IndividualActivityAssignments;
}
export interface BunkJamboreeActivityWithAssignments {
  activity: JamboreeActivity;
  assignments: BunkActivityAssignments;
}
export interface NonBunkJamboreeActivityWithAssignments {
  activity: JamboreeActivity;
  assignments: IndividualActivityAssignments;
}
export type ActivityWithAssignments = BundleActivityWithAssignments | BunkJamboreeActivityWithAssignments | NonBunkJamboreeActivityWithAssignments;

interface BaseActivity {
  id: string;
  name: string;
  description: string;
}
export interface JamboreeActivity extends BaseActivity {};
export interface BundleActivity extends BaseActivity {
  programAreaId: string;
  ageGroup: AgeGroup;
}
export interface ProgramArea {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
}
export type Activity = BundleActivity | JamboreeActivity;

export interface IndividualActivityAssignments {
  camperIds: number[];
  staffIds: number[];
  adminIds: number[];
}
export interface BunkActivityAssignments {
  bunkNums: number[];
  adminIds: number[];
}
export type ActivityAssignments = IndividualActivityAssignments | BunkActivityAssignments;

export interface SectionActivityPreferences {
  sessionId: string;
  sectionId: string;
  blocks: { [blockId: string]: BlockActivityPreferences }
}

export interface BlockActivityPreferences {
  [camperId: number]: { [activityId: string]: number; };
}