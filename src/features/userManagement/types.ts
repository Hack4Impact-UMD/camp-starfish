import { Camper, Employee, Parent } from "@/types/users/userTypes";

export type UsersCsvType = "FAMILY" | "EMPLOYEE";
export const usersCsvTypes: UsersCsvType[] = ["FAMILY", "EMPLOYEE"];

export interface ParsedFamilyCsvData {
  campers: Pick<Camper, "id" | "name" | "parentIds">[];
  parents: Pick<Parent, "id" | "name" | "email" | "camperIds">[];
}
export type ParsedEmployeeCsvData = Pick<Employee, "id" | "name" | "email">[];
export type ParsedUsersCsvData = ParsedFamilyCsvData | ParsedEmployeeCsvData;

export function isParsedFamilyCsvData(data: ParsedUsersCsvData): data is ParsedFamilyCsvData {
  return "campers" in data && "parents" in data;
}

export function isParsedEmployeeCsvData(data: ParsedUsersCsvData): data is ParsedEmployeeCsvData {
  return Array.isArray(data);
}