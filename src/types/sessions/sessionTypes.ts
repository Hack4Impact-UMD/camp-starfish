import { Moment } from "moment";
import { Gender, Name, Role } from "../users/userTypes";
import { StrictExtract } from "@/utils/types/typeUtils";

export interface Session {
  id: string;
  name: string;
  startDate: Moment;
  endDate: Moment;
  linkedAlbumId?: string;
  driveFolderId?: string;
  attendeeIds: number[];
}

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export type SectionType = SchedulingSectionType | "COMMON";

interface BaseSection {
  id: string;
  name: string;
  sessionId: string;
  type: SectionType;
  startDate: Moment;
  endDate: Moment;
}
export interface CommonSection extends BaseSection { type: "COMMON" };
export interface SchedulingSection extends BaseSection {
  type: SchedulingSectionType;
  publishedAt?: Moment;
  numBlocks: number;
}
export type Section = CommonSection | SchedulingSection;

export type AttendeeRole = StrictExtract<Role, "ADMIN" | "CAMPER" | "STAFF">;

interface BaseAttendee {
  attendeeId: number;
  sessionId: string;
  snapshot: {
    name: Name
    gender: Gender;
    dateOfBirth: Moment;
    nonoList: number[];
  };
  role: AttendeeRole;
}

export type AgeGroup = "OCP" | "NAV";
export interface CamperAttendee extends BaseAttendee {
  role: "CAMPER";
  ageGroup: AgeGroup;
  level: 1 | 2 | 3 | 4 | 5;
  bunk: number;
  isOptedOutFromSwim: boolean;
}
export interface StaffAttendee extends BaseAttendee {
  role: "STAFF";
  programCounselorFor?: string;
  bunk: number;
  isLeadBunkCounselor: boolean;
  snapshot: BaseAttendee['snapshot'] & { yesyesList: number[] };
}
export interface AdminAttendee extends BaseAttendee {
  role: "ADMIN";
  snapshot: BaseAttendee['snapshot'] & { yesyesList: number[] };
}
export type Attendee = CamperAttendee | StaffAttendee | AdminAttendee;
export type CounselorAttendee = StaffAttendee | AdminAttendee;

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
  date: Moment;
  bunks: {
    [bunkNum: number]: Record<NightSchedulePosition, number[]>
  }
}

export interface Freeplay {
  sessionId: string;
  date: Moment;
  posts: { [postId: string]: number[]; };
  buddies: Record<number, number[]>;
}

export interface Post {
  id: string;
  name: string;
  description?: string;
  requiresAdminSupervision: boolean;
}

export interface DaysOffSchedule {
  sessionId: string;
  daysOffInSession: Moment[];
  daysOffByCounselorId: {
    [counselorId: number]: Moment[];
  }
}