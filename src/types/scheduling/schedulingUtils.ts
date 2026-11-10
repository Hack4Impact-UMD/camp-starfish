import { ActivityPreferencesDoc, SectionScheduleDoc } from "@/data/firestore/types/documents";
import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import { Activity, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { SchedulingSectionType } from "../sessions/sessionTypes";
import { objectEntries } from "@/utils/types/typeUtils";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programAreaId}: ${activity.name}` : activity.name;
}

const CAPITAL_A_CHAR_CODE = 65;
export function getBlockIndexFromNum(num: number) {
  if (num < 0) { throw new Error("Invalid block num"); }
  let numDigits = 1;
  let mult = 26;
  while (num >= mult) {
    num -= mult;
    numDigits++;
    mult *= 26;
  }
  let blockIndex = "";
  for (let i = 0; i < numDigits; i++) {
    const remainder = num % 26;
    blockIndex = String.fromCharCode(remainder + CAPITAL_A_CHAR_CODE) + blockIndex;
    num = (num - remainder) / 26;
  }
  return blockIndex;
}

export function getEmptySectionScheduleDoc(type: SchedulingSectionType): SectionScheduleDoc {
  return {
    type,
    blocks: {},
    alternatePeriodsOff: {}
  }
}

export function getEmptyActivityPreferencesDoc(): ActivityPreferencesDoc {
  return {
    blocks: {}
  }
}

export function getBlocksInOrder(blocks: SectionSchedule['blocks']) {
  return objectEntries(blocks).sort(([aBlockId, aBlock], [bBlockId, bBlock]) => {
    if (aBlock.startTime.isBefore(bBlock.startTime)) {
      return -1;
    } else if (aBlock.startTime.isAfter(bBlock.startTime)) {
      return 1;
    } else if (aBlock.endTime.isBefore(bBlock.endTime)) {
      return -1;
    } else if (aBlock.endTime.isAfter(bBlock.endTime)) {
      return 1;
    }
    return aBlockId.localeCompare(bBlockId);
  });
}