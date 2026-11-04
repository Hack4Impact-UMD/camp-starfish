import { PersonDirectory } from "@/types/sessions/sessionTypes";
import { ActivityPreferences, ProgramArea, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { AgeGroup, Bunk, Freeplay, NightSchedule, Post, SchedulingSectionType, SectionType } from "@/types/sessions/sessionTypes";
import { Gender, Name, Role } from "@/types/people/personTypes";
import { DistributiveNestedOmit } from "@/utils/types/typeUtils";
import { Timestamp } from "firebase/firestore";

export type PersonDirectoryDoc = Omit<PersonDirectory, "page">;

interface BasePersonDoc {
  uid?: string;
  email?: string;
  name: Name;
  role: Role;
  gender: Gender;
  dateOfBirth: Timestamp;
}

export interface CamperDoc extends BasePersonDoc {
  role: "CAMPER";
  nonoListIds: number[];
}

export interface BaseCounselorDoc extends BasePersonDoc {
  role: "STAFF" | "ADMIN";
  email: string;
  nonoListIds: number[];
  yesyesListIds: number[];
}

export interface StaffDoc extends BaseCounselorDoc {
  role: "STAFF";
}

export interface AdminDoc extends BaseCounselorDoc {
  role: "ADMIN";
  isSuperAdmin: boolean;
}

export type CounselorDoc = StaffDoc | AdminDoc;
export type PersonDoc = CamperDoc | StaffDoc | AdminDoc;

export interface SessionDoc {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  driveFolderId?: string;
  attendeeIds: number[];
}

interface BaseAttendeeDoc {
  snapshot: {
    name: Name;
    gender: Gender;
    dateOfBirth: Timestamp;
    nonoList: number[];
  }
  role: Role;
}

export interface CamperAttendeeDoc extends BaseAttendeeDoc {
  role: "CAMPER";
  ageGroup: AgeGroup;
  level: 1 | 2 | 3 | 4 | 5;
  bunk: number;
  isOptedOutFromSwim: boolean;
}

export interface StaffAttendeeDoc extends BaseAttendeeDoc {
  role: "STAFF";
  programCounselorFor?: string;
  bunk: number;
  isLeadBunkCounselor: boolean;
  snapshot: BaseAttendeeDoc['snapshot'] & { yesyesList: number[]; };
}

export interface AdminAttendeeDoc extends BaseAttendeeDoc {
  role: "ADMIN";
  snapshot: BaseAttendeeDoc['snapshot'] & { yesyesList: number[]; };
}

export type AttendeeDoc = CamperAttendeeDoc | StaffAttendeeDoc | AdminAttendeeDoc;

interface BaseSectionDoc {
  name: string;
  type: SectionType;
  startDate: Timestamp;
  endDate: Timestamp;
}
export interface CommonSectionDoc extends BaseSectionDoc { type: "COMMON" };
export interface SchedulingSectionDoc extends BaseSectionDoc {
  type: SchedulingSectionType;
  publishedAt: Timestamp | null;
}
export type SectionDoc = CommonSectionDoc | SchedulingSectionDoc;

export type SectionScheduleDoc = DistributiveNestedOmit<SectionSchedule, "sessionId" | "sectionId" | "blocks.__dynamic__.blockId" | "blocks.__dynamic__.activities.__dynamic__.id">;
export type BunkDoc = Omit<Bunk, "bunkNum" | "sessionId">;
export type NightScheduleDoc = Omit<NightSchedule, "date" | "sessionId">;
export type FreeplayDoc = Omit<Freeplay, "date" | "sessionId">;

export type ProgramAreaDoc = Omit<ProgramArea, "id">;
export type PostDoc = Omit<Post, "id">;

export interface DaysOffScheduleDoc {
  daysOffInSession: Timestamp[];
  daysOffByCounselorId: {
    [counselorId: number]: Timestamp[];
  }
}

export type ActivityPreferencesDoc = Omit<ActivityPreferences, "sessionId" | "sectionId">;