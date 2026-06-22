
import { StaffAttendee, AdminAttendee, Session, CounselorAttendee, DaysOffSchedule } from "@/types/sessions/sessionTypes";
import { groupBy } from "@/utils/data/groupBy";
import shuffle from "@/utils/data/shuffle";
import { Moment } from "moment";

// TODO: give staff and admins on each other yesYesLists the same days off

interface GenerateDaysOffScheduleRequest {
  session: Session;
  counselors: CounselorAttendee[];
  daysOffInSession: Moment[];
}

export default function generateDaysOffSchedule(req: GenerateDaysOffScheduleRequest): DaysOffSchedule {
  const { session, counselors, daysOffInSession } = req;

  const staff: StaffAttendee[] = [];
  const admins: AdminAttendee[] = [];
  for (const counselor of counselors) {
    switch (counselor.role) {
      case "STAFF":
        staff.push(counselor);
        break;
      case "ADMIN":
        admins.push(counselor);
        break;
      default:
        throw Error("Unknown counselor role");
    }
  }
  const staffByBunk = groupBy(staff, staff => staff.bunk);

  const daysOffByWeek = groupBy(daysOffInSession, day => day.week());
  if (session.startDate.day() !== session.startDate.clone().startOf('week').day()) {
    delete daysOffByWeek[session.startDate.week()];
  }
  if (session.endDate.day() !== session.endDate.clone().endOf('week').day()) {
    delete daysOffByWeek[session.endDate.week()];
  }

  const daysOffByCounselorId: { [counselorId: number]: Moment[] } = {};
  counselors.forEach(counselor => daysOffByCounselorId[counselor.attendeeId] = []);
  for (const weekNum in daysOffByWeek) {
    const daysOffInWeek = daysOffByWeek[weekNum];
    if (daysOffInWeek.length === 0) {
      throw Error("No days off in week");
    }
    const counselorAssignmentOrder: number[] = shuffle([-1, ...Object.keys(staffByBunk).map(bunk => Number(bunk))]).flatMap(bunkNum => bunkNum === -1 ? shuffle(admins.map(admin => admin.attendeeId)) : shuffle(staffByBunk[bunkNum].map(staff => staff.attendeeId)));
    let dayInWeekIndex = 0;
    while (counselorAssignmentOrder.length !== 0) {
      const counselorId = Number(counselorAssignmentOrder.shift());
      daysOffByCounselorId[counselorId].push(daysOffInWeek[dayInWeekIndex]);
      dayInWeekIndex = (dayInWeekIndex + 1) % daysOffInWeek.length;
    }
  } 

  return {
    sessionId: session.id,
    daysOffInSession,
    daysOffByCounselorId,
  }
}