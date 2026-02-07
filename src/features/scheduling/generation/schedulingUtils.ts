import { isAdminAttendee, isCamperAttendee } from "@/types/sessions/sessionTypeGuards";
import { Attendee, CamperAttendee, Freeplay, StaffAttendee } from "@/types/sessions/sessionTypes";

export function doesConflictExist(attendee: Attendee, otherAttendeeIds: number[]) {
  if (isCamperAttendee(attendee)) {
    return attendee.nonoList.some((id) => otherAttendeeIds.includes(id))
  }
  return attendee.nonoList.some((id) => otherAttendeeIds.includes(id)) && attendee.yesyesList.some((id) => otherAttendeeIds.includes(id));
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