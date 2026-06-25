import { IndividualActivityAssignments } from "@/types/scheduling/schedulingTypes";
import { isAdminAttendee, isCamperAttendee } from "@/types/sessions/sessionTypeGuards";
import { Attendee, CounselorAttendee, Freeplay } from "@/types/sessions/sessionTypes";
import { toRecord } from "@/utils/data/toRecord";

export function doesConflictExist(attendee: Attendee, otherAttendeeIds: number[]) {
  if (isCamperAttendee(attendee)) {
    return attendee.snapshot.nonoList.some((id) => otherAttendeeIds.includes(id))
  }
  return attendee.snapshot.nonoList.some((id) => otherAttendeeIds.includes(id)) || attendee.snapshot.yesyesList.some((id) => otherAttendeeIds.includes(id));
}

export function getActivityAttendeeIds(assignees: IndividualActivityAssignments) {
  return [...assignees.camperIds, ...assignees.staffIds, ...assignees.adminIds];
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
  return yesyesListGroups.sort((group1, group2) => {
    const containsAdmin = (counselorId: number) => counselorsById[counselorId].role === "ADMIN";
    const group1ContainsAdmin = group1.some(containsAdmin);
    const group2ContainsAdmin = group2.some(containsAdmin);
    if (group1ContainsAdmin === group2ContainsAdmin) {
      return 0;
    } else if (group1ContainsAdmin) {
      return -1;
    } else {
      return 1;
    }
  });
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