import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import { Activity } from "@/types/scheduling/schedulingTypes";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programAreaId}: ${activity.name}` : activity.name;
}