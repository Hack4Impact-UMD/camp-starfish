import { Camper, Employee } from "./personTypes";
import { ID } from "./utils";

export interface Session {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
  config: SessionConfig;
  albumId?: string;
}
export interface SessionID extends Session, ID { };

export interface SessionConfig {
  numBlocks: number;
  numBundles: number;
  numJamborees: number;
}

export type CamperAttendee = Pick<
  Camper,
  "name" | "gender" | "dateOfBirth" | "nonoList"
> & {
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
};
export interface CamperAttendeeID extends CamperAttendee, ID { };

export type StaffAttendee = Pick<Employee, 'name' | 'gender' | 'nonoList'> & {
  role: "STAFF";
  programCounselor?: ProgramArea;
  bunk: number;
  leadBunkCounselor: boolean;
  daysOff: string[] // ISO-8601
}
export interface StaffAttendeeID extends StaffAttendee, ID { };

export type AdminAttendee = Pick<Employee, 'name' | 'gender' | 'nonoList'> & {
  role: "ADMIN";
  daysOff: string[]; // ISO-8601
}
export interface AdminAttendeeID extends AdminAttendee, ID { };

export interface NightShift {
  [bunkId: number]: {
    sleepInBunk: number[];
    sleepOutside: number[];
  }
}
export interface NightShiftID extends NightShift, ID { };

export type Section = CommonSection | SchedulingSection<SchedulingSectionType>;
export type SectionID = CommonSectionID | SchedulingSectionID<SchedulingSectionType>;

export interface CommonSection {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
}
export interface CommonSectionID extends CommonSection, ID { };

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export interface SchedulingSection<T extends SchedulingSectionType> extends CommonSection {
  type: T;
  freeplays: { [freeplayId: string]: Freeplay };
  blocks: { [blockId: string]: Block<T> };
  alternatePeriodsOff: { [period: string]: number[] }
}
export interface SchedulingSectionID<T extends SchedulingSectionType> extends SchedulingSection<T>, ID { };

export type BundleBlockActivities = (BundleActivity & { assignments: IndividualAssignments })[];
export type BunkJamboreeBlockActivities = (JamboreeActivity & { assignments: BunkAssignments })[];
export type NonBunkJamboreeBlockActivities = (JamboreeActivity & { assignments: IndividualAssignments })[];
export type Block<T> = {
  activities: T extends 'BUNDLE' ? BundleBlockActivities : T extends 'BUNK-JAMBO' ? BunkJamboreeBlockActivities : NonBunkJamboreeBlockActivities;
  periodsOff: number[];
}

export interface ProgramArea {
  name: string;
  code: string;
}

export interface JamboreeActivity {
  name: string;
  description: string;
}

export interface BundleActivity extends JamboreeActivity {
  programArea: ProgramArea;
  ageGroup: AgeGroup;
}

export interface IndividualAssignments {
  camperIds: number[];
  staffIds: number[];
  adminIds: number[];
}

export interface BunkAssignments {
  bunk: number;
  adminIds: number[];
}

export interface Bunk {
  leadCounselor: number;
  staffIds: number[];
  camperIds: number[];
}
export interface BunkID extends Bunk, ID { };

export interface Freeplay {
  posts: { post: Post, assignments: number[] } // Admin & Staff only
  buddies: Record<number, number[]>; // Staff assigned to 1-2 campers each
}
export interface FreeplayID extends Freeplay, ID { };

export interface Post {
  name: string;
}

export type AgeGroup = 'NAV' | 'OCP';