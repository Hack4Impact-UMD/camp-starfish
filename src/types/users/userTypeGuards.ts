import { Admin, Camper, Staff, User } from "./userTypes";

export function isAdmin(user: User): user is Admin { return user.role === "ADMIN" };
export function isStaff(user: User): user is Staff { return user.role === "STAFF" };
export function isCamper(user: User): user is Camper { return user.role === "CAMPER" };