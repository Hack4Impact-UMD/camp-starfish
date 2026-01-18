import { Moment } from "moment";

interface BaseUser {
  id: number;
  uid?: string;
  email: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  role: Role;
  gender: Gender;
  dateOfBirth: Moment;
}

export type Role = "CAMPER" | "PARENT" | "STAFF" | "PHOTOGRAPHER" | "ADMIN";
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
  camperIds: number[];
}

export interface Photographer extends BaseUser {
  role: "PHOTOGRAPHER";
}

export interface Counselor extends BaseUser {
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

export type User = Camper | Parent | Photographer | Staff | Admin;