import { AttendeeRole } from "../sessions/sessionTypes";
import { EmployeeRole, Name, Role } from "./userTypes";

export function getFullName(name: Name) {
  return `${name.firstName} ${name.middleName ? `${name.middleName} ` : ''}${name.lastName}`
}

export const ALL_ROLES: Role[] = ["CAMPER", "PARENT", "PHOTOGRAPHER", "STAFF", "ADMIN"];
export const EMPLOYEE_ROLES: EmployeeRole[] = ["STAFF", "PHOTOGRAPHER", "ADMIN"];
export const ATTENDEE_ROLES: AttendeeRole[] = ["CAMPER", "STAFF", "ADMIN"];

export function isEmployeeRole(role: Role): role is EmployeeRole {
  // @ts-expect-error - Type 'Role' is not assignable to type 'EmployeeRole', but this is a type guard
  return EMPLOYEE_ROLES.includes(role);
}

export function isAttendeeRole(role: Role): role is AttendeeRole {
  // @ts-expect-error - Type 'Role' is not assignable to type 'EmployeeRole', but this is a type guard
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
    case "PHOTOGRAPHER":
      return "Photographers";
    case "PARENT":
      return "Parents";
  }
}