import { Bunk, DaysOffSchedule, NightSchedule, NightSchedulePosition, Session } from "@/types/sessions/sessionTypes";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { StrictExtract } from "@/utils/types/typeUtils";

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

const MIN_COUNSELORS_ON_DUTY = 2;
const MIN_NIGHT_BUNK_DUTY = 2;

function generateNightSchedulesForBunk(bunk: Bunk, daysOffSchedule: DaysOffSchedule, session: Session): { [date: string]: Record<NightSchedulePosition, number[]>; } {
  const positionCounts: { [counselorId: number]: Record<StrictExtract<NightSchedulePosition, "COUNSELOR-ON-DUTY" | "NIGHT-BUNK-DUTY">, number>; } = {};
  for (let currDate = session.startDate.clone(); currDate.isBefore(session.endDate, "day"); currDate = currDate.clone().add(1, 'day')) {
    const counselorsWithDayOff: number[] = [];
    const counselorsWithTomorrowOff: number[] = [];
    if (daysOffSchedule.daysOffInSession.some(dayOff => dayOff.isSame(currDate, 'day'))) {
      for (const counselorId of getObjectKeysAsNumbers(daysOffSchedule.daysOffByCounselorId)) {
        if (!bunk.counselorIds.includes(counselorId)) {
          continue;
        }
        if (daysOffSchedule.daysOffByCounselorId[counselorId].some(day => day.isSame(currDate, 'day'))) {
          counselorsWithDayOff.push(counselorId);
        }
        if (daysOffSchedule.daysOffByCounselorId[counselorId].some(day => day.isSame(currDate.clone().add(1, 'day')))) {
          counselorsWithTomorrowOff.push(counselorId);
        }
      }
    }

    const assignments: Record<NightSchedulePosition, number[]> = {
      "COUNSELOR-ON-DUTY": [],
      "NIGHT-BUNK-DUTY": [],
      "ROVER": []
    };
    for (let i = 0; i < MIN_COUNSELORS_ON_DUTY; i++) {
      const eligibleCounselorIds = bunk.counselorIds.filter(counselorId => !counselorsWithDayOff.includes(counselorId) && !counselorsWithTomorrowOff.includes(counselorId) && !isAssigned(assignments, counselorId));
      if (eligibleCounselorIds.length === 0) {
        assignments["COUNSELOR-ON-DUTY"].push(-1);
        continue;
      }
      const eligibleCounselorIdsSortedByLeastCod = eligibleCounselorIds.sort((a, b) => positionCounts[a]["COUNSELOR-ON-DUTY"] - positionCounts[b]["COUNSELOR-ON-DUTY"]);
      const assignedCounselorId = eligibleCounselorIdsSortedByLeastCod[0];
      assignments["COUNSELOR-ON-DUTY"].push(assignedCounselorId);
    }
    for (let i = 0; i < MIN_NIGHT_BUNK_DUTY; i++) {
      const eligibleCounselorIds = bunk.counselorIds.filter(counselorId => !counselorsWithDayOff.includes(counselorId) && !isAssigned(assignments, counselorId));
      if (eligibleCounselorIds.length === 0) {
        assignments["NIGHT-BUNK-DUTY"].push(-1);
        continue;
      }
      const eligibleCounselorIdsSortedByLeastNbd = eligibleCounselorIds.sort((a, b) => positionCounts[a]["NIGHT-BUNK-DUTY"] - positionCounts[b]["NIGHT-BUNK-DUTY"]);
      const assignedCounselorId = eligibleCounselorIdsSortedByLeastNbd[0];
      assignments["NIGHT-BUNK-DUTY"].push(assignedCounselorId);
    }
    const remainingCounselorIds = bunk.counselorIds.filter(counselorId => !counselorsWithDayOff.includes(counselorId) && !isAssigned(assignments, counselorId));
    assignments["ROVER"] = remainingCounselorIds;
  }

  return {};
}

function isAssigned(assignments: NightSchedule['bunks'][number], counselorId: number) {
  return [...assignments["COUNSELOR-ON-DUTY"], ...assignments["NIGHT-BUNK-DUTY"], ...assignments["ROVER"]].includes(counselorId);
}