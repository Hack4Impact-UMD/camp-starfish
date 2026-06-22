import { DaysOffSchedule, NightSchedule, Session } from "@/types/sessions/sessionTypes";

interface GenerateNightSchedulesRequest {
  session: Session;
  daysOffSchedule: DaysOffSchedule;
  bunkNums: number[];
}

export default function generateNightSchedules(req: GenerateNightSchedulesRequest): NightSchedule[] {
  const { session, daysOffSchedule, bunkNums } = req;
  
  for (const bunkNum of bunkNums) {
    getNightSchedulesForBunk(bunkNum, daysOffSchedule, session)
  }
  // generate night schedules by bunk
  // merge into a single night schedule

  return [];
}

function getNightSchedulesForBunk(bunkNum: number, daysOffSchedule: DaysOffSchedule, session: Session)  {
  for (let currDate = session.startDate.clone(); currDate.isBefore(session.endDate, "day"); currDate = currDate.clone().add(1, 'day')) {
    const counselorsWithDayOff: number[] = [];
    
    if (daysOffSchedule.daysOffInSession.some(dayOff => dayOff.isSame(currDate, 'day'))) {
      for (const counselorId in daysOffSchedule.daysOffByCounselorId) {
        if ()
      }
    }
  }
}