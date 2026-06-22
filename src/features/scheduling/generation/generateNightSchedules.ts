import { Bunk, DaysOffSchedule, NightSchedule, Session } from "@/types/sessions/sessionTypes";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";

interface GenerateNightSchedulesRequest {
  session: Session;
  daysOffSchedule: DaysOffSchedule;
  bunks: Bunk[];
}

export default function generateNightSchedules(req: GenerateNightSchedulesRequest): NightSchedule[] {
  const { session, daysOffSchedule, bunks } = req;
  
  for (const bunk of bunks) {
    generateNightSchedulesForBunk(bunk, daysOffSchedule, session)
  }
  // generate night schedules by bunk
  // merge into a single night schedule

  return [];
}

function generateNightSchedulesForBunk(bunk: Bunk, daysOffSchedule: DaysOffSchedule, session: Session)  {
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

}