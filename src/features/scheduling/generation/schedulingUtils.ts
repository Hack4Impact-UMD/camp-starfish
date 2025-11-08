import { AttendeeID, BundleActivity, BunkAssignments, Freeplay, IndividualAssignments, JamboreeActivity } from "@/types/sessionTypes";

export function doesConflictExist(attendee: AttendeeID, otherAttendeeIds: number[]) {
  if (attendee.role === "CAMPER") {
    return attendee.nonoList.some((id) => otherAttendeeIds.includes(id))
  }
  return attendee.nonoList.some((id) => otherAttendeeIds.includes(id)) && attendee.yesyesList.some((id) => otherAttendeeIds.includes(id));
}

export function isBundleActivity(activity: BundleActivity | JamboreeActivity): activity is BundleActivity {
  return 'programArea' in activity && 'ageGroup' in activity;
}

export function isJamboreeActivity(activity: BundleActivity | JamboreeActivity): activity is JamboreeActivity {
  return !('programArea' in activity) && !('ageGroup' in activity); 
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

export function isIndividualAssignments(assignments: IndividualAssignments | BunkAssignments): assignments is IndividualAssignments {
  return 'camperIds' in assignments;
}

export function isBunkAssignments(assignments: IndividualAssignments | BunkAssignments): assignments is BunkAssignments {
  return 'bunkNums' in assignments;
}
