import { BunkActivityAssignments, IndividualActivityAssignments } from "@/types/scheduling/schedulingTypes";
import { isAdminAttendee, isCamperAttendee } from "@/types/sessions/sessionTypeGuards";
import { AdminAttendee, Attendee, Bunk, CamperAttendee, CounselorAttendee, Freeplay, StaffAttendee } from "@/types/sessions/sessionTypes";
import { toRecord } from "@/utils/data/toRecord";

export function canBeAssignedToIndividualActivityAssignments(attendee: Attendee, assignments: IndividualActivityAssignments) {
  const attendeeIds = getAttendeeIdsFromIndividualActivityAssignments(assignments);
  if (isCamperAttendee(attendee)) {
    return attendee.snapshot.nonoList.every((id) => !attendeeIds.includes(id))
  }
  const counselorIds = getCounelorIdsFromIndividualActivityAssignments(assignments);
  return attendee.snapshot.nonoList.every((id) => !attendeeIds.includes(id)) || attendee.snapshot.yesyesList.some((id) => !counselorIds.includes(id));
}

export function getAttendeeIdsFromIndividualActivityAssignments(assignments: IndividualActivityAssignments) {
  return [...assignments.camperIds, ...assignments.staffIds, ...assignments.adminIds];
}

export function getCounelorIdsFromIndividualActivityAssignments(assignments: IndividualActivityAssignments) {
  return [...assignments.staffIds, ...assignments.adminIds];
}

export function canBeAssignedToBunkAssignments(assignee: Bunk, assignments: BunkActivityAssignments, bunksByBunkNum: { [bunkNum: number]: Bunk; }, bunkMembersById: { [bunkMemberId: number]: StaffAttendee | CamperAttendee }): boolean
export function canBeAssignedToBunkAssignments(assignee: AdminAttendee, assignments: BunkActivityAssignments, bunksByBunkNum: { [bunkNum: number]: Bunk; }): boolean
export function canBeAssignedToBunkAssignments(assignee: AdminAttendee | Bunk, assignments: BunkActivityAssignments, bunksByBunkNum: { [bunkNum: number]: Bunk; }, bunkMembersById?: { [bunkMemberId: number]: StaffAttendee | CamperAttendee }): boolean {
  const attendeeIds = getAttendeeIdsFromBunkAssignments(assignments, bunksByBunkNum);
  const counselorIds = getCounselorIdsFromBunkAssignments(assignments, bunksByBunkNum);
  if ('attendeeId' in assignee) {
    return assignee.snapshot.nonoList.every((id) => !attendeeIds.includes(id)) || assignee.snapshot.yesyesList.every((id) => !counselorIds.includes(id));
  } else if (!bunkMembersById) {
    throw Error("Missing bunkMembersById field when checking if bunk can be assigned to bunk activity assignments.");
  };
  return assignments.bunkNums.every((bunkNum: number) => {
    const bunk = bunksByBunkNum[bunkNum];
    return bunk.camperIds.every((camperId: number) => {
      const camper = bunkMembersById[camperId] as CamperAttendee;
      return camper.snapshot.nonoList.every((id) => !attendeeIds.includes(id));
    }) && bunk.counselorIds.every((counselorId: number) => {
      const staffer = bunkMembersById[counselorId] as StaffAttendee;
      return staffer.snapshot.nonoList.every((id) => !attendeeIds.includes(id)) && staffer.snapshot.yesyesList.every((id) => !counselorIds.includes(id));
    })
  })
}

export function getAttendeeIdsFromBunkAssignments(assignments: BunkActivityAssignments, bunksByBunkNum: { [bunkNum: number]: Bunk }) {
  const attendeeIds = [...assignments.adminIds];
  assignments.bunkNums.forEach((bunkNum: number) => attendeeIds.push(...bunksByBunkNum[bunkNum].camperIds, ...bunksByBunkNum[bunkNum].counselorIds));
  return attendeeIds;
}

export function getCounselorIdsFromBunkAssignments(assignments: BunkActivityAssignments, bunksByBunkNum: { [bunkNum: number]: Bunk }) {
  const attendeeIds = [...assignments.adminIds];
  assignments.bunkNums.forEach((bunkNum: number) => attendeeIds.push(...bunksByBunkNum[bunkNum].counselorIds));
  return attendeeIds;
}

export function getFreeplayAssignmentId(freeplay: Freeplay, id: number): number[] | number | string | null {
  for (const [postId, employeeIds] of Object.entries(freeplay.posts)) {
    if (employeeIds.includes(id)) {
      return postId;
    }
  }

  for (const [staffId, camperIds] of Object.entries(freeplay.buddies)) {
    if (Number(staffId) === id) {
      return camperIds;
    } else if (camperIds.includes(id)) {
      return Number(staffId);
    }
  }
  return null;
}

export function getAttendeesById<T extends Attendee>(attendees: T[]): Record<number, T> {
  const attendeesById: Record<number, T> = {};
  attendees.forEach(attendee => attendeesById[attendee.attendeeId] = attendee);
  return attendeesById;
}

export function groupAttendeesByBunk<T extends Attendee>(attendees: T[]): Record<number, T[]> {
  const attendeesByBunk: Record<number, T[]> = {};
  attendees.forEach(attendee => {
    if (isAdminAttendee(attendee)) {
      if (!attendeesByBunk[-1]) {
        attendeesByBunk[-1] = [];
      }
      attendeesByBunk[-1].push(attendee);
      return;
    }
    if (!attendeesByBunk[attendee.bunk]) {
      attendeesByBunk[attendee.bunk] = [];
    }
    attendeesByBunk[attendee.bunk].push(attendee);
  });
  return attendeesByBunk;
}

export function getYesYesListGroups(counselors: CounselorAttendee[]): number[][] {
  const yesyesListGroups: number[][] = [];
  const counselorsById = toRecord(counselors, (counselor) => counselor.attendeeId);
  const visitedCounselorIds = new Set<number>();
  for (const counselor of counselors) {
    if (!visitedCounselorIds.has(counselor.attendeeId)) {
      const group = getYesYesListGroup(counselor.attendeeId, visitedCounselorIds, counselorsById);
      yesyesListGroups.push(group);
    }
  }
  return yesyesListGroups;
}

function getYesYesListGroup(firstCounselorId: number, visited: Set<number>, counselorsById: Record<number, CounselorAttendee>): number[] {
  const group: number[] = [];
  const stack: number[] = [firstCounselorId];
  while (stack.length !== 0) {
    const nextCounselorId = stack.pop()!;
    if (!visited.has(nextCounselorId)) {
      group.push(nextCounselorId);
      stack.push(...counselorsById[nextCounselorId].snapshot.yesyesList);
      visited.add(nextCounselorId);
    }
  }
  return group;
}