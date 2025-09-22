import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, Block } from "@/types/sessionTypes";

export function conflictExists(attendeeID: CamperAttendeeID | StaffAttendeeID, attendeeID2: CamperAttendeeID | StaffAttendeeID): boolean {
  return false;
}

export function assignDaysOff(daysOff: string[], attendeeID: StaffAttendeeID | AdminAttendeeID): void {
}

export function assignPeriodsOff<T>(block: Block<T>, attendeeId: StaffAttendeeID | AdminAttendeeID): void {
}