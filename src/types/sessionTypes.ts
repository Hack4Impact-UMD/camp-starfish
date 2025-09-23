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

export type Attendee = CamperAttendee | StaffAttendee | AdminAttendee;
export type AttendeeID = CamperAttendeeID | StaffAttendeeID | AdminAttendeeID;

export type CamperAttendee = Pick<
  Camper,
  "name" | "gender" | "dateOfBirth" | "nonoList"
> & {
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
};
export interface CamperAttendeeID extends CamperAttendee, ID { sessionId: string; };

export type StaffAttendee = Pick<Employee, 'name' | 'gender' | 'nonoList'> & {
  role: "STAFF";
  programCounselor?: ProgramArea;
  bunk: number;
  leadBunkCounselor: boolean;
  daysOff: string[] // ISO-8601
}
export interface StaffAttendeeID extends StaffAttendee, ID { sessionId: string; };

export type AdminAttendee = Pick<Employee, 'name' | 'gender' | 'nonoList'> & {
  role: "ADMIN";
  daysOff: string[]; // ISO-8601
}
export interface AdminAttendeeID extends AdminAttendee, ID { sessionId: string; };

export interface NightShift {
  [bunkId: number]: {
    sleepInBunk: number[];
    sleepOutside: number[];
  }
}
export interface NightShiftID extends NightShift, ID { sessionId: string; };

export type SectionType = 'COMMON' | SchedulingSectionType;
export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";

export interface Section {
  name: string;
  type: SectionType;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
}
export interface SectionID extends Section, ID { sessionId: string; };

export interface SectionSchedule<T extends SchedulingSectionType> {
  blocks: { [blockId: string]: Block<T> };
  alternatePeriodsOff: { [period: string]: number[] }
}
export interface SectionScheduleID<T extends SchedulingSectionType> extends SectionSchedule<T>, ID { sessionId: string; sectionId: string; };

export type Bundle = SectionSchedule<'BUNDLE'>;
export type BundleID = SectionScheduleID<'BUNDLE'>;
export type BunkJamboree = SectionSchedule<'BUNK-JAMBO'>;
export type BunkJamboreeID = SectionScheduleID<'BUNK-JAMBO'>;
export type NonBunkJamboree = SectionSchedule<'NON-BUNK-JAMBO'>;
export type NonBunkJamboreeID = SectionScheduleID<'NON-BUNK-JAMBO'>;

export type Block<T> = {
  activities: T extends 'BUNDLE' ? BundleBlockActivities : T extends 'BUNK-JAMBO' ? BunkJamboreeBlockActivities : NonBunkJamboreeBlockActivities;
  periodsOff: number[];
}

export type BundleBlockActivities = (BundleActivity & { assignments: IndividualAssignments })[];
export type BunkJamboreeBlockActivities = (JamboreeActivity & { assignments: BunkAssignments })[];
export type NonBunkJamboreeBlockActivities = (JamboreeActivity & { assignments: IndividualAssignments })[];

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
export interface BunkID extends Bunk, ID { sessionId: string; };

export interface Freeplay {
  posts: { post: Post, assignments: number[] } // Admin & Staff only
  buddies: Record<number, number[]>; // Staff assigned to 1-2 campers each
}
export interface FreeplayID extends Freeplay, ID { sessionId: string; };

export interface Post {
  name: string;
}

export type AgeGroup = 'NAV' | 'OCP';

export interface Preferences {
  [attendeeId: number]: { [activityId: string]: number };
}