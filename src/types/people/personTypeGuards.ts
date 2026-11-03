import { Admin, Camper, Staff, Person } from "./personTypes";

export function isAdmin(person: Person): person is Admin { return person.role === "ADMIN" };
export function isStaff(person: Person): person is Staff { return person.role === "STAFF" };
export function isCamper(person: Person): person is Camper { return person.role === "CAMPER" };