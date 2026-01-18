import { Moment } from "moment";
import { Gender, Role } from "./userTypes";

interface Session {
  id: string;
  name: string;
  startDate: Moment;
  endDate: Moment;
  albumId?: string;
  driveFolderId: string;
}

export type SchedulingSectionType = "BUNDLE" | "BUNK-JAMBO" | "NON-BUNK-JAMBO";
export type SectionType = SchedulingSectionType | "COMMON";

interface BaseSection {
  id: string;
  sessionId: string;
  type: SectionType;
  startDate: Moment;
  endDate: Moment;
}

interface CommonSection extends BaseSection { type: "COMMON" }
interface SchedulingSection extends BaseSection {
  type: SchedulingSectionType;
  isSchedulePublished: boolean;
  isScheduleOutdated: boolean;
}
type Section = CommonSection | SchedulingSection;

interface BaseAttendee {
  attendeeId: string;
  sessionId: string;
  snapshot: {
    name: {
      firstName: string;
      middleName?: string;
      lastName: string;
    },
    gender: Gender;
    age: number;
  };
  role: Role;
}

export type AgeGroup = "OCP" | "NAV";
interface CamperAttendee extends BaseAttendee {
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
  isOptedOutFromSwim: boolean;
}
interface StaffAttendee extends BaseAttendee {
  programCounselor?: string;
  bunk: number;
  leadBunkCounselor: boolean;
  daysOff: Moment[];
}
interface AdminAttendee extends BaseAttendee {
  daysOff: Moment[]; 
}
export type Attendee = CamperAttendee | StaffAttendee | AdminAttendee;

interface Bunk {
  bunkNum: number;
  leadCounselorId: number;
  employeeIds: number[];
  camperIds: number[];
}

export type NightSchedulePosition = "COUNSELOR-ON-DUTY" | "NIGHT-BUNK-DUTY" | "ROVER";
interface NightSchedule {
  sessionId: string;
  date: Moment;
  bunks: {
    [bunkNum: number]: Record<NightSchedulePosition, number[]>
  }
}
