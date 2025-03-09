import { PhotoPermissions } from "./albumTypes";

export interface Person {
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  }
}

export interface Camper extends Person {
  campminderId: number;
  dateOfBirth: string; // ISO-8601
  photoPermissions: PhotoPermissions;
  parentIds: UserIds[];
  programIds: string[];
}

export interface UserIds {
  campminderId: number;
  uid: string | null;
}

export interface User extends Person {
  ids: UserIds;
  email: string;
  role: Role;
}

export interface Parent extends User {
  role: "PARENT";
  camperIds: number[];
}

export interface Employee extends User {
  role: EmployeeRole;
  programIds: string[];
}

export type Role = "PARENT" | EmployeeRole;
export type EmployeeRole = "STAFF" | "PHOTOGRAPHER" | "ADMIN";