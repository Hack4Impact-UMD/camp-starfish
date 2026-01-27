import { AdminAttendee, Attendee, CamperAttendee, CommonSection, SchedulingSection, Section, StaffAttendee } from "./sessionTypes";

export function isCommonSection(section: Section): section is CommonSection { return section.type === "COMMON"; };
export function isSchedulingSection(section: Section): section is SchedulingSection { return section.type === "BUNDLE" || section.type === "BUNK-JAMBO" || section.type === "NON-BUNK-JAMBO"; };

export function isCamperAttendee(attendee: Attendee): attendee is CamperAttendee { return attendee.role === "CAMPER"; };
export function isStaffAttendee(attendee: Attendee): attendee is StaffAttendee { return attendee.role === "STAFF"; };
export function isAdminAttendee(attendee: Attendee): attendee is AdminAttendee { return attendee.role === "ADMIN"; };