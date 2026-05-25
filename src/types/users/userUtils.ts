import { AttendeeRole } from "../sessions/sessionTypes";
import { Name, Role } from "./userTypes";

export function getFullName(name: Name) {
  return `${name.firstName} ${name.middleName ? `${name.middleName} ` : ''}${name.lastName}`
}

export const roles: Role[] = ["CAMPER", "PARENT", "PHOTOGRAPHER", "STAFF", "ADMIN"];
export const attendeeRoles: AttendeeRole[] = ["CAMPER", "STAFF", "ADMIN"];

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