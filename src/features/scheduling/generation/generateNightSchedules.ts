import { Bunk, DaysOffSchedule, NightSchedule, NightSchedulePosition, Session } from "@/types/sessions/sessionTypes";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import moment from "moment";

interface GenerateNightSchedulesRequest {
  session: Session;
  daysOffSchedule: DaysOffSchedule;
  bunks: Bunk[];
}

export default function generateNightSchedules(req: GenerateNightSchedulesRequest): NightSchedule[] {
  const { session, daysOffSchedule, bunks } = req;

  const nightSchedules: { [date: string]: NightSchedule; } = {};
  for (let currDate = session.startDate.clone(); currDate.isBefore(session.endDate, "day"); currDate = currDate.clone().add(1, 'day')) {
    nightSchedules[currDate.format("YYYY-MM-DD")] = {
      sessionId: session.id,
      date: currDate.clone(),
      bunks: {}
    };
  }
  for (const bunk of bunks) {
    const bunkSchedules = generateNightSchedulesForBunk(bunk, daysOffSchedule, session);
    for (const dateStr in bunkSchedules) {
      nightSchedules[dateStr].bunks[bunk.bunkNum] = bunkSchedules[dateStr];
    }
  }
  return Object.values(nightSchedules);
}

function generateNightSchedulesForBunk(bunk: Bunk, daysOffSchedule: DaysOffSchedule, session: Session): { [date: string]: Record<NightSchedulePosition, number[]>; } {
  // calculate frequencies

  // determine who days off and who can;t be CBD
  // assign COD & NBD positions
  // assign rover positions

  for (let currDate = session.startDate.clone(); currDate.isBefore(session.endDate, "day"); currDate = currDate.clone().add(1, 'day')) {
    const counselorsWithDayOff: number[] = [];
    const counselorsWithTomorrowOff: number[] = [];
    if (daysOffSchedule.daysOffInSession.some(dayOff => dayOff.isSame(currDate, 'day'))) {
      for (const counselorId of getObjectKeysAsNumbers(daysOffSchedule.daysOffByCounselorId)) {
        if (!bunk.counselorIds.includes(counselorId)) {
          continue;
        } else if (daysOffSchedule.daysOffByCounselorId[counselorId].some(day => day.isSame(currDate, 'day'))) {
          counselorsWithDayOff.push(counselorId);
        } else if (daysOffSchedule.daysOffByCounselorId[counselorId].some(day => day.isSame(currDate.clone().add(1, 'day')))) {
          counselorsWithTomorrowOff.push(counselorId);
        }
      }
    }
  }

  // determine who can't be COD

  return {};
}