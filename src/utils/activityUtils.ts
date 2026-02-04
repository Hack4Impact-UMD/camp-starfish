import { isBundleActivity } from "@/types/sessions/sessionTypeGuards";
import { Activity } from "@/types/sessions/sessionTypes";

export function getActivityName(activity: Activity): string {
  return isBundleActivity(activity) ? `${activity.programArea.id}: ${activity.name}` : activity.name;
}