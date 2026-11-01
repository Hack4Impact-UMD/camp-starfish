import { Admin, Camper, Staff, Person } from "./userTypes";

export function isAdmin(user: Person): user is Admin { return user.role === "ADMIN" };
export function isStaff(user: Person): user is Staff { return user.role === "STAFF" };
export function isCamper(user: Person): user is Camper { return user.role === "CAMPER" };