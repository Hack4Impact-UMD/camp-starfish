import { Admin, User } from "./userTypes";

export function isAdmin(user: User): user is Admin { return user.role === "ADMIN" };
export function isStaff(user: User): user is Admin { return user.role === "STAFF" };
export function isPhotographer(user: User): user is Admin { return user.role === "PHOTOGRAPHER" };
export function isCamper(user: User): user is Admin { return user.role === "CAMPER" };
export function isParent(user: User): user is Admin { return user.role === "PARENT" };