import { Moment } from "moment";

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
}

interface Attendee extends BaseAttendee {

  ageAtSessionStart: number;
  ageGroup: AgeGroup;
  level: number;
  bunk: number;
}

type AgeGroup = "OCP" | "NAV";

interface Bunk {
  bunkNum: number;
  leadCounselorId: number;
  employeeIds: number[];
  camperIds: number[];
}

interface NightSchedule {

}
