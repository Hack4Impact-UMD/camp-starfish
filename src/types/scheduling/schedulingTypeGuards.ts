import { Activity, ActivityAssignments, ActivityWithAssignments, Block, BundleActivity, BundleActivityWithAssignments, BundleBlock, BundleSectionSchedule, BunkActivityAssignments, BunkJamboreeActivityWithAssignments, BunkJamboreeBlock, BunkJamboreeSectionSchedule, IndividualActivityAssignments, JamboreeActivity, NonBunkJamboreeActivityWithAssignments, NonBunkJamboreeBlock, NonBunkJamboreeSectionSchedule, SectionSchedule } from "./schedulingTypes";

export function isBundleSectionSchedule(sectionSchedule: SectionSchedule): sectionSchedule is BundleSectionSchedule { return sectionSchedule.type === "BUNDLE"; };
export function isBunkJamboreeSectionSchedule(sectionSchedule: SectionSchedule): sectionSchedule is BunkJamboreeSectionSchedule { return sectionSchedule.type === "BUNK-JAMBO"; };
export function isNonBunkJamboreeSectionSchedule(sectionSchedule: SectionSchedule): sectionSchedule is NonBunkJamboreeSectionSchedule { return sectionSchedule.type === "NON-BUNK-JAMBO"; };

export function isBundleBlock(block: Block): block is BundleBlock { return block.activities.length > 0 && isBundleActivityWithAssignments(block.activities[0]); };
export function isBunkJamboreeBlock(block: Block): block is BunkJamboreeBlock { return block.activities.length > 0 && isBunkJamboreeActivityWithAssignments(block.activities[0]); };
export function isNonBunkJamboreeBlock(block: Block): block is NonBunkJamboreeBlock { return block.activities.length > 0 && isNonBunkJamboreeActivityWithAssignments(block.activities[0]); };

export function isBundleActivity(activity: Activity): activity is BundleActivity { return 'programArea' in activity };
export function isJamboreeActivity(activity: Activity): activity is JamboreeActivity { return !('programArea' in activity); }

export function isBundleActivityWithAssignments(activityWithAssignments: ActivityWithAssignments): activityWithAssignments is BundleActivityWithAssignments { return isBundleActivity(activityWithAssignments.activity); }
export function isBunkJamboreeActivityWithAssignments(activityWithAssignments: ActivityWithAssignments): activityWithAssignments is BunkJamboreeActivityWithAssignments { return isJamboreeActivity(activityWithAssignments.activity) && isBunkActivityAssignments(activityWithAssignments.assignments); }
export function isNonBunkJamboreeActivityWithAssignments(activityWithAssignments: ActivityWithAssignments): activityWithAssignments is NonBunkJamboreeActivityWithAssignments { return isJamboreeActivity(activityWithAssignments.activity) && isIndividualActivityAssignments(activityWithAssignments.assignments); }

export function isIndividualActivityAssignments(activityAssignments: ActivityAssignments): activityAssignments is IndividualActivityAssignments { return 'camperIds' in activityAssignments; };
export function isBunkActivityAssignments(activityAssignments: ActivityAssignments): activityAssignments is BunkActivityAssignments { return 'bunkNums' in activityAssignments; };