import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, Block } from "@/types/sessionTypes";

// Takes in two attendees and checks if there is a conflict between them using the `nonoList` field. 
export function conflictExists(attendeeID: CamperAttendeeID | StaffAttendeeID, attendeeID2: CamperAttendeeID | StaffAttendeeID): boolean {
  return false;
}

// Appends the given daysOff array to the given attendee in their `daysOff` field
export function assignDaysOff(daysOff: string[], attendeeID: StaffAttendeeID | AdminAttendeeID): void {}

// Appends the given attendeeIDs array to the given block in its `periodsOff` field
export function assignPeriodsOff<T>(block: Block<T>, attendeeIDs: (StaffAttendeeID | AdminAttendeeID)[]): void {}


export function assignNightShifts(): void {}