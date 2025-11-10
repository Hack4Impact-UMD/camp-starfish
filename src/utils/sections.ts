import { SectionType, SchedulingSectionType } from "@/types/sessionTypes";

/**
 * Maps UI schedule type labels to database SectionType values
 */
export function mapScheduleTypeToSectionType(scheduleType: string): SectionType {
  switch (scheduleType) {
    case 'Bundle':
      return 'BUNDLE';
    case 'Bunk Jamboree':
      return 'BUNK-JAMBO';
    case 'Non-Bunk Jamboree':
      return 'NON-BUNK-JAMBO';
    case 'Non-Scheduling':
      return 'COMMON';
    default:
      return 'COMMON';
  }
}

/**
 * Maps database SectionType values to UI schedule type labels
 */
export function mapSectionTypeToScheduleType(sectionType: SectionType): string {
  switch (sectionType) {
    case 'BUNDLE':
      return 'Bundle';
    case 'BUNK-JAMBO':
      return 'Bunk Jamboree';
    case 'NON-BUNK-JAMBO':
      return 'Non-Bunk Jamboree';
    case 'COMMON':
      return 'Non-Scheduling';
    default:
      return 'Non-Scheduling';
  }
}

/**
 * Determines if a section type is a scheduling section
 */
export function isSchedulingSectionType(sectionType: SectionType): sectionType is SchedulingSectionType {
  return sectionType === 'BUNDLE' || sectionType === 'BUNK-JAMBO' || sectionType === 'NON-BUNK-JAMBO';
}

/**
 * Gets default number of blocks for a schedule type
 */
export function getDefaultNumBlocks(scheduleType: string): number {
  switch (scheduleType) {
    case 'Bundle':
      return 4;
    case 'Bunk Jamboree':
    case 'Non-Bunk Jamboree':
      return 2;
    default:
      return 0;
  }
}
