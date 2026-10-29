import { AttendeeRole } from "../sessions/sessionTypes";
import { CounselorRole, Gender, Name, Role } from "./userTypes";

export function getFullName(name: Name) {
  return `${name.firstName} ${name.middleName ? `${name.middleName} ` : ''}${name.lastName}`
}

export const ALL_ROLES: Role[] = ["CAMPER", "PARENT", "STAFF", "ADMIN"];
export const COUNSELOR_ROLES: CounselorRole[] = ["STAFF", "ADMIN"];
export const ATTENDEE_ROLES: AttendeeRole[] = ["CAMPER", "STAFF", "ADMIN"];

export const GENDERS: Gender[] = ["Male", "Female", "Other"];

export function isCounselorRole(role: Role): role is CounselorRole {
  // @ts-expect-error - Type 'Role' is not assignable to type 'CounselorRole', but this is a type guard
  return COUNSELOR_ROLES.includes(role);
}

export function isAttendeeRole(role: Role): role is AttendeeRole {
  // @ts-expect-error - Type 'Role' is not assignable to type 'AttendeeRole', but this is a type guard
  return ATTENDEE_ROLES.includes(role);
}

export function getPluralRole(role: Role) {
  switch (role) {
    case "STAFF":
      return "Staff";
    case "ADMIN":
      return "Admins";
    case "CAMPER":
      return "Campers";
    case "PARENT":
      return "Parents";
  }
}