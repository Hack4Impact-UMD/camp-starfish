import { Camper, Parent, UnregisteredEmployee } from "@/types/users/userTypes";

export type UsersCsvType = "FAMILY" | "EMPLOYEE";
export const usersCsvTypes: UsersCsvType[] = ["FAMILY", "EMPLOYEE"];

export interface ParsedFamilyCsvData {
  campers: { [camperId: number]: Pick<Camper, "id" | "name" | "parentIds">; };
  parents: { [parentId: number]: Pick<Parent, "id" | "name" | "email" | "camperIds">; };
}
export type ParsedEmployeeCsvData = Omit<UnregisteredEmployee, "role">[];
export type ParsedUsersCsvData = ParsedFamilyCsvData | ParsedEmployeeCsvData;

export function isParsedFamilyCsvData(data: ParsedUsersCsvData): data is ParsedFamilyCsvData {
  return "campers" in data && "parents" in data;
}

export function isParsedEmployeeCsvData(data: ParsedUsersCsvData): data is ParsedEmployeeCsvData {
  return Array.isArray(data);
}