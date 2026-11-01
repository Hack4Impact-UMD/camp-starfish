import { Camper, Counselor } from "@/types/users/userTypes";

export type UsersCsvType = "CAMPER" | "COUNSELOR";
export const usersCsvTypes: UsersCsvType[] = ["CAMPER", "COUNSELOR"];

export interface ParsedCamperCsvData {
  campers: Pick<Camper, "id" | "name">[];
}
export type ParsedCounselorCsvData = Pick<Counselor, "id" | "name" | "email">[];
export type ParsedUsersCsvData = ParsedCamperCsvData | ParsedCounselorCsvData;

export function isParsedCamperCsvData(data: ParsedUsersCsvData): data is ParsedCamperCsvData {
  return "campers" in data;
}

export function isParsedCounselorCsvData(data: ParsedUsersCsvData): data is ParsedCounselorCsvData {
  return Array.isArray(data);
}