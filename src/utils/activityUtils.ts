import { isBundleActivity } from "@/types/sessionTypeGuards";
import { Activity } from "@/types/sessionTypes";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programArea.id}: ${activity.name}` : activity.name;
}