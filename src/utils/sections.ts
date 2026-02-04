import { SectionType, SchedulingSectionType } from "@/types/sessions/sessionTypes";

export function isSchedulingSectionType(sectionType: SectionType): sectionType is SchedulingSectionType {
  return sectionType === 'BUNDLE' || sectionType === 'BUNK-JAMBO' || sectionType === 'NON-BUNK-JAMBO';
}