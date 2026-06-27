import { SectionScheduleDoc } from "@/data/firestore/types/documents";
import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import { Activity } from "@/types/scheduling/schedulingTypes";
import { SchedulingSectionType } from "../sessions/sessionTypes";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programAreaId}: ${activity.name}` : activity.name;
}

const CAPITAL_A_CHAR_CODE = 65;
export function getBlockIdFromNum(num: number) {
  if (num < 0 || num >= 10) throw Error("Invalid block number");
  return String.fromCharCode(num + CAPITAL_A_CHAR_CODE);
}

export function getEmptySectionScheduleDoc(type: SchedulingSectionType, numBlocks: number) {
  const sectionScheduleDoc: SectionScheduleDoc = {
    type,
    blocks: {},
    alternatePeriodsOff: {}
  }
  for (let i = 0; i < numBlocks; i++) {
    sectionScheduleDoc.blocks[getBlockIdFromNum(i)] = {
      activities: [],
      periodsOff: []
    }
  }
  return sectionScheduleDoc;
}

export const DEFAULT_NUMBER_BLOCKS = 5;