import { Admin, Camper, Staff } from "./personTypes";
import { ID } from "./utils";

export interface Session {
  name: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
  albumId?: string;
}
export interface SessionID extends Session, ID { };

export type Attendee = CamperAttendee | StaffAttendee | AdminAttendee;
export type AttendeeID = CamperAttendeeID | StaffAttendeeID | AdminAttendeeID;

export type CamperAttendee = Pick<
  Camper,
  "name" | "gender" | "dateOfBirth" | "nonoList"
> & {
  role: "CAMPER";
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
};
export interface CamperAttendeeID extends CamperAttendee, ID { sessionId: string; };

export type StaffAttendee = Pick<Staff, 'name' | 'gender' | 'nonoList' | 'yesyesList'> & {
  role: "STAFF";
  programCounselor?: ProgramArea;
  bunk: number;
  leadBunkCounselor: boolean;
  daysOff: string[] // ISO-8601
}
export interface StaffAttendeeID extends StaffAttendee, ID { sessionId: string; };

export type AdminAttendee = Pick<Admin, 'name' | 'gender' | 'nonoList' | 'yesyesList'> & {
  role: "ADMIN";
  daysOff: string[]; // ISO-8601
}
export interface AdminAttendeeID extends AdminAttendee, ID { sessionId: string; };

export interface NightShift {
  [bunkId: number]: {
    counselorsOnDuty: number[];
    nightBunkDuty: number[];
  }
}
export interface NightShiftID extends NightShift, ID { sessionId: string; };

export type SectionType = 'COMMON' | SchedulingSectionType;
export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";

export type Section = CommonSection | SchedulingSection;
export type SectionID = CommonSectionID | SchedulingSectionID;

export interface CommonSection {
  name: string;
  type: 'COMMON';
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601, exclusive
}
export interface CommonSectionID extends CommonSection, ID { sessionId: string; };

export type SchedulingSection = Omit<CommonSection, 'type'> & {
  type: SchedulingSectionType;
  numBlocks: number;
}
export interface SchedulingSectionID extends SchedulingSection, ID { sessionId: string; };

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
  isDeleted: boolean;
}
export interface ProgramAreaID extends ProgramArea, ID { };

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
  posts: { [postId: string]: number[] } // Admin & Staff only
  buddies: Record<number, number[]>; // Staff assigned to 1-2 campers each
}
export interface FreeplayID extends Freeplay, ID { sessionId: string; };

export interface Post {
  name: string;
  requiresAdmin: boolean;
}
export interface PostID extends Post, ID { }

export type AgeGroup = 'NAV' | 'OCP';

export interface Preferences {
  [attendeeId: number]: { [activityId: string]: number };
}