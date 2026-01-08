import { isBunkAssignments, isIndividualAssignments } from "@/features/scheduling/generation/schedulingUtils";
import { Activity, ActivityWithAssignments, BundleActivity, BundleActivityWithAssignments, BunkJamboreeActivityWithAssignments, JamboreeActivity, NonBunkJamboreeActivityWithAssignments } from "./sessionTypes";

export function isBundleActivity(activity: Activity): activity is BundleActivity {
  return 'programArea' in activity;
}

export function isJamboreeActivity(activity: Activity): activity is JamboreeActivity {
  return !('programArea' in activity);
}

export function isBundleActivityWithAssignments(activityWithAssignments: ActivityWithAssignments): activityWithAssignments is BundleActivityWithAssignments {
  return isBundleActivity(activityWithAssignments);
}

export function isBunkJamboreeActivityWithAssignments(activityWithAssignments: ActivityWithAssignments): activityWithAssignments is BunkJamboreeActivityWithAssignments {
  return isJamboreeActivity(activityWithAssignments) && isBunkAssignments(activityWithAssignments.assignments);
}

export function isNonBunkJamboreeActivityWithAssignments(activityWithAssignments: ActivityWithAssignments): activityWithAssignments is NonBunkJamboreeActivityWithAssignments {
  return isJamboreeActivity(activityWithAssignments) && isIndividualAssignments(activityWithAssignments.assignments);
}