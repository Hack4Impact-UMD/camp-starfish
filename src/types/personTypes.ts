import { PhotoPermissions } from "./albumTypes";
import { ID } from "./utils";

export interface Person {
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  gender: "Male" | "Female" | "Other";
  role: Role;
}
export interface PersonID extends Person, ID {};

export interface Camper extends Person {
  role: "CAMPER";
  dateOfBirth: string; // ISO-8601
  photoPermissions: PhotoPermissions;
  parentIds: number[]; // camperminderIds
  nonoList: number[]; // camperminderIds
}
export interface CamperID extends Camper, ID {};

export interface User extends Person {
  uid: string;
  email: string;
  role: UserRole;
}
export interface UserID extends User, ID {};

export interface Parent extends User {
  role: "PARENT";
  camperIds: number[];
}
export interface ParentID extends Parent, ID {};

export interface Employee extends User {
  role: EmployeeRole;
  sessionIds: string[];
  nonoList: number[];
}
export interface EmployeeID extends Employee, ID {};

export type Role = "CAMPER" | UserRole;
export type UserRole = "PARENT" | EmployeeRole;
export type EmployeeRole = "STAFF" | "PHOTOGRAPHER" | "ADMIN";