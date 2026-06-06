// user pipeline 
// starts off as unregistered user
// gets uid upon registered
// gets full profile once fills out form

export type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
export type FamilyRole = Extract<Role, "CAMPER" | "PARENT">;
export type EmployeeRole = Extract<Role, "STAFF" | "PHOTOGRAPHER" | "ADMIN">;
export type CounselorRole = Extract<EmployeeRole, "STAFF" | "ADMIN">;

interface BaseUnregisteredUser {
  id: number;
  name: Name;
  role: Role;
  uid: string | null;
}

export interface UnregisteredCamper extends BaseUnregisteredUser {
  role: "CAMPER";
  parentIds: number[];
}

export interface UnregisteredParent extends BaseUnregisteredUser {
  role: "PARENT";
  camperIds: number[];
  email: string;
}

export interface UnregisteredPhotographer extends BaseUnregisteredUser {
  role: "PHOTOGRAPHER";
  email: string;
}

export interface UnregisteredStaff extends BaseUnregisteredUser {
  role: "STAFF";
  email: string;
}

export interface UnregisteredAdmin extends BaseUnregisteredUser {
  role: "ADMIN";
  email: string;
}

export type UnregisteredUser = UnregisteredCamper | UnregisteredParent | UnregisteredPhotographer | UnregisteredStaff | UnregisteredAdmin;
export type UnregisteredFamilyMember = UnregisteredCamper | UnregisteredParent;
export type UnregisteredEmployee = UnregisteredPhotographer | UnregisteredCounselor;
export type UnregisteredCounselor = UnregisteredStaff | UnregisteredAdmin;

interface BaseRegisteredUser {
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
  preferredName?: string;
  middleName?: string;
  lastName: string;
}

export type Gender = "Male" | "Female" | "Other";

export type PhotoPermissions = "PUBLIC" | "PRIVATE";
export interface Camper extends BaseRegisteredUser {
  role: "CAMPER";
  photoPermissions: PhotoPermissions;
  parentIds: number[];
  nonoListIds: number[];
}

export interface Parent extends BaseRegisteredUser {
  role: "PARENT";
  camperIds: number[];
}

export interface Photographer extends BaseRegisteredUser {
  role: "PHOTOGRAPHER";
}

export interface Counselor extends BaseRegisteredUser {
  role: "STAFF" | "ADMIN";
  nonoListIds: number[];
  yesyesListIds: number[];
}

export interface Staff extends Counselor {
  role: "STAFF"
}

export interface Admin extends Counselor {
  role: "ADMIN"
}

export type Employee = Staff | Photographer | Admin;

export type RegisteredUser = Camper | Parent | Photographer | Staff | Admin;
export type User = RegisteredUser | UnregisteredUser;