import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import { Activity } from "@/types/scheduling/schedulingTypes";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programAreaId}: ${activity.name}` : activity.name;
}

const CAPITAL_A_CHAR_CODE = 65;
export function getBlockIdFromNum(num: number) {
  if (num < 0 || num >= 10) throw Error("Invalid block number");
  return String.fromCharCode(num + CAPITAL_A_CHAR_CODE);
}