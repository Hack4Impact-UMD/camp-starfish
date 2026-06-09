import { Moment } from "moment";

export type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
export type FamilyRole = Extract<Role, "CAMPER" | "PARENT">;
export type EmployeeRole = Extract<Role, "STAFF" | "PHOTOGRAPHER" | "ADMIN">;
export type CounselorRole = Extract<EmployeeRole, "STAFF" | "ADMIN">;

interface BaseUser {
  id: number;
  uid?: string;
  email?: string;
  name: Name;
  role: Role;
  gender: Gender;
  dateOfBirth: Moment;
}

export interface Name {
  firstName: string;
  preferredName?: string;
  middleName?: string;
  lastName: string;
}

export type Gender = "Male" | "Female" | "Other";

export type PhotoPermissions = "PUBLIC" | "PRIVATE";
export interface Camper extends BaseUser {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}

export interface Parent extends BaseUser {
  role: "PARENT";
  email: string;
  camperIds: number[];
}

export interface Photographer extends BaseUser {
  role: "PHOTOGRAPHER";
  email: string;
}

export interface Counselor extends BaseUser {
  role: "STAFF" | "ADMIN";
  email: string;
  nonoListIds: number[];
  yesyesListIds: number[];
}

export interface Staff extends Counselor {
  role: "STAFF"
}

export interface Admin extends Counselor {
  role: "ADMIN"
}

export type FamilyMember = Camper | Parent;
export type Employee = Staff | Photographer | Admin;
export type User = Camper | Parent | Photographer | Staff | Admin;