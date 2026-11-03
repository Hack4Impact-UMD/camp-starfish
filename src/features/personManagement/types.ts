import { Camper, Counselor } from "@/types/people/personTypes";

export type PeopleCsvType = "CAMPER" | "COUNSELOR";
export const peopleCsvTypes: PeopleCsvType[] = ["CAMPER", "COUNSELOR"];

export interface ParsedCamperCsvData {
  campers: Pick<Camper, "id" | "name">[];
}
export type ParsedCounselorCsvData = Pick<Counselor, "id" | "name" | "email">[];
export type ParsedPeopleCsvData = ParsedCamperCsvData | ParsedCounselorCsvData;

export function isParsedCamperCsvData(data: ParsedPeopleCsvData): data is ParsedCamperCsvData {
  return "campers" in data;
}

export function isParsedCounselorCsvData(data: ParsedPeopleCsvData): data is ParsedCounselorCsvData {
  return Array.isArray(data);
}