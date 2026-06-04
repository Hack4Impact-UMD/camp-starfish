import { Camper, Parent, UnregisteredEmployee } from "@/types/users/userTypes";

export type UsersCsvType = "FAMILY" | "EMPLOYEE";
export const usersCsvTypes: UsersCsvType[] = ["FAMILY", "EMPLOYEE"];

export interface ParsedFamilyCsvData {
  campers: { [camperId: number]: Pick<Camper, "id" | "name" | "parentIds">; };
  parents: { [parentId: number]: Pick<Parent, "id" | "name" | "email" | "camperIds">; };
}

export type ParsedEmployeeCsvData = Omit<UnregisteredEmployee, "role">[]