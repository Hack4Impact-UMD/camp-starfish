import { AttendeeID } from "@/types/sessionTypes";

export function doesConflictExist(attendee: AttendeeID, otherAttendeeIds: number[]) {
  if (attendee.role === "CAMPER") {
    return attendee.nonoList.some((id) => otherAttendeeIds.includes(id))
  }
  return attendee.nonoList.some((id) => otherAttendeeIds.includes(id)) && attendee.yesyesList.some((id) => otherAttendeeIds.includes(id));
}