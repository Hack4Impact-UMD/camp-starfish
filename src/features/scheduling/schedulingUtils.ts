import { AttendeeID } from "@/types/sessionTypes";

export function doesConflictExist(attendee: AttendeeID, otherAttendeeIds: number[]) {
  if (attendee.role === "CAMPER") {
    return attendee.nonoList.every((id) => !otherAttendeeIds.includes(id))
  }
  return attendee.nonoList.every((id) => !otherAttendeeIds.includes(id)) && attendee.yesyesList.every((id) => !otherAttendeeIds.includes(id));
}