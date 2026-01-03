import { PhotoPermissions } from "./albumTypes";
import { ID } from "./utils";

export interface Person {
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  gender: "Male" | "Female" | "Other";
}

interface RoleField {
  role: Role;
}

export type Role = "CAMPER" | UserRole;
export type UserRole = "PARENT" | EmployeeRole;
export type EmployeeRole = "STAFF" | "PHOTOGRAPHER" | "ADMIN";

export interface Camper extends Person {
  dateOfBirth: string; // ISO-8601
  photoPermissions: PhotoPermissions;
  parentIds: number[]; // camperminderIds
  nonoList: number[]; // camperminderIds
}
export interface CamperID extends Camper, ID<number>, RoleField { role: "CAMPER" };

interface User extends Person {
  uid: string;
  email: string;
}

export interface Parent extends User {
  camperIds: number[];
}
export interface ParentID extends Parent, ID<number>, RoleField { role: "PARENT" };

export interface Photographer extends User {
  sessionIds: string[];
}
export interface PhotographerID extends Photographer, ID<number>, RoleField { role: "PHOTOGRAPHER" };

export interface Counselor extends User {
  sessionIds: string[];
  nonoList: number[];
  yesyesList: number[];
}
export type Staff = Counselor;
export interface StaffID extends Staff, ID<number>, RoleField { role: "STAFF" };
export type Admin = Counselor;
export interface AdminID extends Admin, ID<number>, RoleField { role: "ADMIN" };