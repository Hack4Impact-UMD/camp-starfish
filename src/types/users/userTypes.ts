interface BaseUser {
  id: number;
  uid?: string;
  email?: string;
  name: Name;
  role: Role;
  gender: Gender;
  dateOfBirth: string;
}

export interface Name {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
export type EmployeeRole = Extract<Role, "STAFF" | "PHOTOGRAPHER" | "ADMIN">
export type Gender = "Male" | "Female" | "Other";

export type PhotoPermissions = "PUBLIC" | "PRIVATE";
export interface Camper extends BaseUser {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}
export type UnregisteredCamper = Pick<Camper, "id" | "name" | "role" | "parentIds">

export interface Parent extends BaseUser {
  role: "PARENT";
  camperIds: number[];
}
export type UnregisteredParent = Pick<Parent, "id" | "name" | "role" | "email" | "camperIds">

export interface Photographer extends BaseUser {
  role: "PHOTOGRAPHER";
}

export interface Counselor extends BaseUser {
  role: "STAFF" | "ADMIN";
  nonoListIds: number[];
  yesyesListIds: number[];
}
export type UnregisteredCounselor = Pick<Counselor, "id" | "name" | "role" | "email">

export interface Staff extends Counselor {
  role: "STAFF"
}

export interface Admin extends Counselor {
  role: "ADMIN"
}

export type Employee = Staff | Photographer | Admin;
export type UnregisteredEmployee = Pick<Employee, "id" | "name" | "role" | "email">;

export type UnregisteredUser = UnregisteredCamper | UnregisteredParent | UnregisteredEmployee;
export type User = Camper | Parent | Photographer | Staff | Admin;