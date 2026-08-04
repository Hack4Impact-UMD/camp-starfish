
import { getUseAttendeeListOptions } from "@/hooks/attendees/useAttendeeList";
import { getUseSessionOptions } from "@/hooks/sessions/useSession";
import { StaffAttendee, AdminAttendee, Session, CounselorAttendee, DaysOffSchedule } from "@/types/sessions/sessionTypes";
import { groupBy } from "@/utils/data/groupBy";
import shuffle from "@/utils/data/shuffle";
import { useMutation } from "@tanstack/react-query";
import { Moment } from "moment";

interface UseGenerateDaysOffScheduleRequest {
  sessionId: string;
}

export default function useGenerateDaysOffSchedule() {
  return useMutation({
    mutationFn: async (req: UseGenerateDaysOffScheduleRequest, { client }) => {
      const { sessionId } = req;

      const session = await client.ensureQueryData(getUseSessionOptions(sessionId));
      const counselors = (await client.ensureInfiniteQueryData(getUseAttendeeListOptions(sessionId, {
        where: [{ fieldPath: "role", operation: "in", value: ["STAFF", "ADMIN"] }],
      }))).pages.flatMap(page => page.docs) as CounselorAttendee[];

      const daysOffInSession: Moment[] = [];
      for (let curr = session.startDate.clone(); curr.isSameOrBefore(session.endDate); curr = curr.add(1, 'days')) {
        daysOffInSession.push(curr.clone());
      }

      return generateDaysOffSchedule({
        session,
        counselors,
        daysOffInSession
      });
    }
  })
}

// TODO: give staff and admins on each other yesYesLists the same days off
// TODO: take section activities into account when assigning days off, namely for program counselor assignments

interface GenerateDaysOffScheduleRequest {
  session: Session;
  counselors: CounselorAttendee[];
  daysOffInSession: Moment[];
}

export function generateDaysOffSchedule(req: GenerateDaysOffScheduleRequest): DaysOffSchedule {
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