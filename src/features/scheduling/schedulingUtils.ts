import { AttendeeID, BundleActivity, JamboreeActivity } from "@/types/sessionTypes";

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