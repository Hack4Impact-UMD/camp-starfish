import { Moment } from "moment";
import { AgeGroup, SchedulingSectionType } from "../sessions/sessionTypes";
import { UUIDV4 } from "../utils/idTypes";

interface BaseSectionSchedule {
  sessionId: string;
  sectionId: string;
  type: SchedulingSectionType;
  blocks: Record<UUIDV4, Block>;
  alternatePeriodsOff: { [periodId: string]: number[] };
}
export interface BundleSectionSchedule extends BaseSectionSchedule {
  type: "BUNDLE",
  blocks: Record<UUIDV4, BundleBlock>;
}
export interface BunkJamboreeSectionSchedule extends BaseSectionSchedule {
  type: "BUNK-JAMBO",
  blocks: Record<UUIDV4, BunkJamboreeBlock>;
}
export interface NonBunkJamboreeSectionSchedule extends BaseSectionSchedule {
  type: "NON-BUNK-JAMBO",
  blocks: Record<UUIDV4, NonBunkJamboreeBlock>;
}
export type SectionSchedule = BundleSectionSchedule | BunkJamboreeSectionSchedule | NonBunkJamboreeSectionSchedule;

interface BaseBlock {
  startTime: Moment;
  endTime: Moment
  activities: Record<UUIDV4, ActivityWithAssignments>;
  periodsOff: number[];
}
export interface BundleBlock extends BaseBlock { activities: Record<UUIDV4, BundleActivityWithAssignments>; }
export interface BunkJamboreeBlock extends BaseBlock { activities: Record<UUIDV4, BunkJamboreeActivityWithAssignments>; }
export interface NonBunkJamboreeBlock extends BaseBlock { activities: Record<UUIDV4, NonBunkJamboreeActivityWithAssignments>; }
export interface EmptyBlock extends BaseBlock { activities: Record<UUIDV4, never>; };
export type Block = BundleBlock | BunkJamboreeBlock | NonBunkJamboreeBlock | EmptyBlock;

export type BundleActivityWithAssignments = BundleActivity & IndividualActivityAssignments;
export type BunkJamboreeActivityWithAssignments = JamboreeActivity & BunkActivityAssignments;
export type NonBunkJamboreeActivityWithAssignments = JamboreeActivity & IndividualActivityAssignments;
export type ActivityWithAssignments = BundleActivityWithAssignments | BunkJamboreeActivityWithAssignments | NonBunkJamboreeActivityWithAssignments;

interface BaseActivity {
  name: string;
  description: string;
}
export type JamboreeActivity = BaseActivity;
export interface BundleActivity extends BaseActivity {
  programAreaId: string;
  ageGroup: AgeGroup;
}
export interface ProgramArea {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  ageGroups: AgeGroup[]
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

export type ActivityPreferences = {
  sessionId: string;
  sectionId: string;
} & SectionActivityPreferences;

export interface SectionActivityPreferences {
  blocks: { [blockId: string]: BlockActivityPreferences }
}

export interface BlockActivityPreferences {
  [camperId: number]: { [activityId: string]: number; };
}