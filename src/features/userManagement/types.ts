import { Camper, Counselor } from "@/types/users/userTypes";

export type UsersCsvType = "FAMILY" | "COUNSELOR";
export const usersCsvTypes: UsersCsvType[] = ["FAMILY", "COUNSELOR"];

export interface ParsedFamilyCsvData {
  campers: Pick<Camper, "id" | "name">[];
}
export type ParsedCounselorCsvData = Pick<Counselor, "id" | "name" | "email">[];
export type ParsedUsersCsvData = ParsedFamilyCsvData | ParsedCounselorCsvData;

export function isParsedFamilyCsvData(data: ParsedUsersCsvData): data is ParsedFamilyCsvData {
  return "campers" in data;
}

export function isParsedCounselorCsvData(data: ParsedUsersCsvData): data is ParsedCounselorCsvData {
  return Array.isArray(data);
}