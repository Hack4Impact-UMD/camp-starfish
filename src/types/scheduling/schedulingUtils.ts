import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import { Activity } from "@/types/scheduling/schedulingTypes";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programAreaId}: ${activity.name}` : activity.name;
}

// will start returning non-letter characters if num is greater than or equal to 26 - fix later
const CAPITAL_A_CHAR_CODE = 65;
export function getBlockIdFromNum(num: number) {
  return String.fromCharCode(num + CAPITAL_A_CHAR_CODE);
}