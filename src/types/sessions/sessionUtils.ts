import { SectionType, Session } from "./sessionTypes";
import moment from "moment";

export function getDayNumOfSession(date: string, session: Session) {
  return moment(date).diff(session.startDate, 'days') + 1;
}

export const sectionTypes: SectionType[] = ["COMMON", "BUNDLE", "BUNK-JAMBO", "NON-BUNK-JAMBO"];
export function getFullSectionTypeName(sectionType: SectionType) {
  return {
    "COMMON": "Common",
    "BUNDLE": "Bundle",
    "BUNK-JAMBO": "Bunk Jamboree",
    "NON-BUNK-JAMBO": "Non-Bunk Jamboree"
  }[sectionType];
}