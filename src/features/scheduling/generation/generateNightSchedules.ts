import { Bunk, DaysOffSchedule, NightSchedule, NightSchedulePosition, Session } from "@/types/sessions/sessionTypes";
import shuffle from "@/utils/data/shuffle";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";
import { StrictExtract } from "@/utils/types/typeUtils";

interface GenerateNightSchedulesRequest {
  session: Session;
  daysOffSchedule: DaysOffSchedule;
  bunks: Bunk[];
  adminIds: number[];
}

export default function generateNightSchedules(req: GenerateNightSchedulesRequest): NightSchedule[] {
  const { session, daysOffSchedule, bunks } = req;

  const nightSchedulesByDate: { [date: string]: NightSchedule; } = {};
  for (let currDate = session.startDate.clone(); currDate.isBefore(session.endDate, "day"); currDate = currDate.add(1, 'day')) {
    nightSchedulesByDate[currDate.format("YYYY-MM-DD")] = {
      sessionId: session.id,
      date: currDate.clone(),
      bunks: {}
    };
  }
  for (const bunk of bunks) {
    const bunkSchedules = generateNightSchedulesForBunk(bunk, daysOffSchedule, session);
    for (const dateStr in bunkSchedules) {
      nightSchedulesByDate[dateStr].bunks[bunk.bunkNum] = bunkSchedules[dateStr];
    }
  }

  const nightSchedules = Object.values(nightSchedulesByDate);
  for (const nightSchedule of nightSchedules) {
    const roverIdsToBunkNum: { [counselorId: number]: number; } = {};
    for (const bunkNum of getObjectKeysAsNumbers(nightSchedule.bunks)) {
      for (const roverId of nightSchedule.bunks[bunkNum]["ROVER"]) {
        roverIdsToBunkNum[roverId] = bunkNum;
      }
    }

    const availableAdminIds = [...req.adminIds];

    for (const bunkNum of getObjectKeysAsNumbers(nightSchedule.bunks)) {
      nightSchedule.bunks[bunkNum]["COUNSELOR-ON-DUTY"] = nightSchedule.bunks[bunkNum]["COUNSELOR-ON-DUTY"].map(counselorId => {
        if (counselorId !== -1) return counselorId;
        const adminId = shuffle(availableAdminIds).shift();
        return adminId ?? null;
      }).filter(counselorId => counselorId !== null);
      nightSchedule.bunks[bunkNum]["NIGHT-BUNK-DUTY"] = nightSchedule.bunks[bunkNum]["NIGHT-BUNK-DUTY"].map(counselorId => {
        if (counselorId !== -1) return counselorId;
        const roverId = shuffle(getObjectKeysAsNumbers(roverIdsToBunkNum)).shift();
        if (!roverId) {
          const adminId = shuffle(availableAdminIds).shift();
          return adminId ?? null;
        }
        nightSchedule.bunks[roverIdsToBunkNum[roverId]]["ROVER"] = nightSchedule.bunks[roverIdsToBunkNum[roverId]]["ROVER"].filter(id => id !== roverId);
        delete roverIdsToBunkNum[roverId];
        return roverId;
      }).filter(counselorId => counselorId !== null)
    }
  }
  return Object.values(nightSchedulesByDate);
}

const MIN_COUNSELORS_ON_DUTY = 2;
const MIN_NIGHT_BUNK_DUTY = 2;

function generateNightSchedulesForBunk(bunk: Bunk, daysOffSchedule: DaysOffSchedule, session: Session): { [date: string]: Record<NightSchedulePosition, number[]>; } {
  const positionCounts: { [counselorId: number]: Record<StrictExtract<NightSchedulePosition, "COUNSELOR-ON-DUTY" | "NIGHT-BUNK-DUTY">, number>; } = {};
  for (const counselorId of bunk.counselorIds) {
    positionCounts[counselorId] = {
      "COUNSELOR-ON-DUTY": 0,
      "NIGHT-BUNK-DUTY": 0
    };
  }

  const assignments: ReturnType<typeof generateNightSchedulesForBunk> = {};
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

    const dayAssignments: Record<NightSchedulePosition, number[]> = {
      "COUNSELOR-ON-DUTY": [],
      "NIGHT-BUNK-DUTY": [],
      "ROVER": []
    };
    for (let i = 0; i < MIN_COUNSELORS_ON_DUTY; i++) {
      const eligibleCounselorIds = bunk.counselorIds.filter(counselorId => !counselorsWithDayOff.includes(counselorId) && !counselorsWithTomorrowOff.includes(counselorId) && !isAssigned(dayAssignments, counselorId));
      if (eligibleCounselorIds.length === 0) {
        dayAssignments["COUNSELOR-ON-DUTY"].push(-1);
        continue;
      }
      const eligibleCounselorIdsSortedByLeastCod = shuffle(eligibleCounselorIds).sort((a, b) => positionCounts[a]["COUNSELOR-ON-DUTY"] - positionCounts[b]["COUNSELOR-ON-DUTY"]);
      const assignedCounselorId = eligibleCounselorIdsSortedByLeastCod[0];
      dayAssignments["COUNSELOR-ON-DUTY"].push(assignedCounselorId);
      positionCounts[assignedCounselorId]["COUNSELOR-ON-DUTY"]++;
    }
    for (let i = 0; i < MIN_NIGHT_BUNK_DUTY; i++) {
      const eligibleCounselorIds = bunk.counselorIds.filter(counselorId => !counselorsWithDayOff.includes(counselorId) && !isAssigned(dayAssignments, counselorId));
      if (eligibleCounselorIds.length === 0) {
        dayAssignments["NIGHT-BUNK-DUTY"].push(-1);
        continue;
      }
      const eligibleCounselorIdsSortedByLeastNbd = shuffle(eligibleCounselorIds).sort((a, b) => positionCounts[a]["NIGHT-BUNK-DUTY"] - positionCounts[b]["NIGHT-BUNK-DUTY"]);
      const assignedCounselorId = eligibleCounselorIdsSortedByLeastNbd[0];
      dayAssignments["NIGHT-BUNK-DUTY"].push(assignedCounselorId);
      positionCounts[assignedCounselorId]["NIGHT-BUNK-DUTY"]++;
    }
    const remainingCounselorIds = bunk.counselorIds.filter(counselorId => !counselorsWithDayOff.includes(counselorId) && !isAssigned(dayAssignments, counselorId));
    dayAssignments["ROVER"] = remainingCounselorIds;

    assignments[currDate.format("YYYY-MM-DD")] = dayAssignments;
  }
  return assignments;
}

function isAssigned(assignments: NightSchedule['bunks'][number], counselorId: number) {
  return [...assignments["COUNSELOR-ON-DUTY"], ...assignments["NIGHT-BUNK-DUTY"], ...assignments["ROVER"]].includes(counselorId);
}