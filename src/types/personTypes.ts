import { PhotoPermissions } from "./albumTypes";

export interface Person {
  campminderId: number;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  }
}

export interface Camper extends Person {
  dateOfBirth: string; // ISO-8601
  photoPermissions: PhotoPermissions;
  parentIds: number[]; // camperminderIds
  nonoList: number[]; // camperminderIds
}

export interface User extends Person {
  uid: string;
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
  nonoList: number[];
}

export type Role = "PARENT" | EmployeeRole;
export type EmployeeRole = "STAFF" | "PHOTOGRAPHER" | "ADMIN";