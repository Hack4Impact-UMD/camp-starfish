import { StrictExtract } from "@/utils/types/typeUtils";
import { Moment } from "moment";

export type Role = "CAMPER" | "STAFF" | "ADMIN";
export type CounselorRole = StrictExtract<Role, "STAFF" | "ADMIN">;

interface BasePerson {
  id: number;
  name: Name;
  role: Role;
  gender: Gender;
  dateOfBirth: Moment;
}

export interface Camper extends BasePerson {
  role: "CAMPER";
  nonoListIds: number[];
}

interface BaseCounselor extends BasePerson {
  role: CounselorRole;
  uid?: string;
  email: string;
  nonoListIds: number[];
  yesyesListIds: number[];
}

export interface Name {
  firstName: string;
  preferredName?: string;
  middleName?: string;
  lastName: string;
}

export type Gender = "Male" | "Female" | "Other";

export interface Staff extends BaseCounselor {
  role: "STAFF";
}

export interface Admin extends BaseCounselor {
  role: "ADMIN";
  isSuperAdmin: boolean;
}

export type Counselor = Staff | Admin;
export type Person = Camper | Staff | Admin;