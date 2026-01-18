import { Moment } from "moment";

interface Session {

}

interface Section {

}

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

interface BaseBlock {

  activities: Activity[];
  periodsOff: number[];
}

interface JamboreeActivity {
  name: string;
  description: string;
}

interface BundleActivity extends JamboreeActivity {
  programArea: ProgramArea;
  ageGroup: AgeGroup;
}

interface Activity {

}

interface BundleActivityWithAssignments {
  activity: BundleActivity;
  assignments: BunkActivityAssignments;
};
interface BunkJamboreeActivityWithAssignments {
  activity: JamboreeActivity;
  assignments: BunkActivityAssignments;
};
interface NonBunkJamboreeActivityWithAssignments {
  activity: JamboreeActivity;
  assignments: IndividualActivityAssignments;
};

interface IndividualActivityAssignments {
  adminIds: number[];
  staffIds: number[];
  camperIds: number[];
}

interface BunkActivityAssignments {
  adminIds: number[];
  bunkNums: number[];
}

interface ProgramArea {

}

interface BaseSectionSchedule {
  blocks: { [blockId: string]: Block }
  alternatePeriodsOff: { [periodId: string]: number[] }
}

interface BundleSchedule extends BaseSectionSchedule{
  blocks: { [blockId: string]: BundleBlock }
}

interface SectionSchedule {
  blocks: { [blockId: string]: Block }
}

interface Freeplay {
  date: Moment;
  sessionId: string;
  posts: { [postId: string]: number[] };
  buddies: Record<number, number[]>
}

interface Post {
  id: string;
  name: string;
  requiresAdmin: boolean;
}

interface ActivityPreferences {
  
}