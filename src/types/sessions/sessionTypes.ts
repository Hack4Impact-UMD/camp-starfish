import { Gender, Name, Role } from "../users/userTypes";

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  albumId?: string;
  driveFolderId: string;
}

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export type SectionType = SchedulingSectionType | "COMMON";

interface BaseSection {
  id: string;
  name: string;
  sessionId: string;
  type: SectionType;
  startDate: string;
  endDate: string;
}
export interface CommonSection extends BaseSection { type: "COMMON" }
export interface SchedulingSection extends BaseSection {
  type: SchedulingSectionType;
  isSchedulePublished: boolean;
  isScheduleOutdated: boolean;
}
export type Section = CommonSection | SchedulingSection;

interface BaseAttendee {
  attendeeId: number;
  sessionId: string;
  snapshot: {
    name: Name
    gender: Gender;
    age: number;
  };
  role: Role;
}

export type AgeGroup = "OCP" | "NAV";
export interface CamperAttendee extends BaseAttendee {
  role: "CAMPER";
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
  isOptedOutFromSwim: boolean;
}
export interface StaffAttendee extends BaseAttendee {
  role: "STAFF";
  programCounselorFor?: string;
  bunk: number;
  leadBunkCounselor: boolean;
  daysOff: string[];
}
export interface AdminAttendee extends BaseAttendee {
  role: "ADMIN";
  daysOff: string[];
}
export type Attendee = CamperAttendee | StaffAttendee | AdminAttendee;

export interface Bunk {
  bunkNum: number;
  sessionId: string;
  leadCounselorId: number;
  counselorIds: number[];
  camperIds: number[];
}

export type NightSchedulePosition = "COUNSELOR-ON-DUTY" | "NIGHT-BUNK-DUTY" | "ROVER";
export interface NightSchedule {
  sessionId: string;
  date: string;
  bunks: {
    [bunkNum: number]: Record<NightSchedulePosition, number[]>
  }
}

export interface Freeplay {
  sessionId: string;
  date: string;
  posts: { [postId: string]: number[]; };
  buddies: Record<number, number[]>;
}

export interface Post {
  id: string;
  name: string;
  description?: string;
  requiresAdminSupervision: boolean;
}