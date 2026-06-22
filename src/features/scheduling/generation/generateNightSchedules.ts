import { DaysOffSchedule, NightSchedule, Session } from "@/types/sessions/sessionTypes";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";

interface GenerateNightSchedulesRequest {
  session: Session;
  daysOffSchedule: DaysOffSchedule;
  bunkNums: number[];
}

export default function generateNightSchedules(req: GenerateNightSchedulesRequest): NightSchedule[] {
  const { session, daysOffSchedule, bunkNums } = req;
  
  for (const bunkNum of bunkNums) {
    generateNightSchedulesForBunk(bunkNum, daysOffSchedule, session)
  }
  // generate night schedules by bunk
  // merge into a single night schedule

  return [];
}

function generateNightSchedulesForBunk(bunkNum: number, daysOffSchedule: DaysOffSchedule, session: Session)  {
  for (let currDate = session.startDate.clone(); currDate.isBefore(session.endDate, "day"); currDate = currDate.clone().add(1, 'day')) {
    const counselorsWithDayOff: number[] = [];
    
    if (daysOffSchedule.daysOffInSession.some(dayOff => dayOff.isSame(currDate, 'day'))) {
      for (const counselorId of getObjectKeysAsNumbers(daysOffSchedule.daysOffByCounselorId)) {
        if (daysOffSchedule.daysOffByCounselorId[counselorId].some(day => day.isSame(currDate, 'day'))) {
          counselorsWithDayOff.push(counselorId);
        }
      }
    }
  }
}