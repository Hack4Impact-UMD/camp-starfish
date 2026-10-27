import { StrictExtract } from "@/utils/types/typeUtils";
import { Moment } from "moment";

export type Role = "CAMPER" | "PARENT" | "STAFF" | "ADMIN";
export type FamilyRole = StrictExtract<Role, "CAMPER" | "PARENT">;
export type CounselorRole = StrictExtract<Role, "STAFF" | "ADMIN">;

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

export interface Camper extends BaseUser {
  role: "CAMPER";
  parentIds: number[];
  nonoListIds: number[];
}

export interface Parent extends BaseUser {
  role: "PARENT";
  email: string;
  camperIds: number[];
}

export interface BaseCounselor extends BaseUser {
  role: "STAFF" | "ADMIN";
  email: string;
  nonoListIds: number[];
  yesyesListIds: number[];
}

export interface Staff extends BaseCounselor {
  role: "STAFF";
}

export interface Admin extends BaseCounselor {
  role: "ADMIN";
  isSuperAdmin: boolean;
}

export type FamilyMember = Camper | Parent;
export type Counselor = Staff | Admin;
export type User = Camper | Parent | Staff | Admin;