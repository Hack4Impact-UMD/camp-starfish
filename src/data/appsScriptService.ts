import { auth, functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import { CamperAttendeeID, BundleBlockActivities, BunkJamboreeBlockActivities, NonBunkJamboreeBlockActivities } from "@/types/sessionTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function callAppsScript(functionName: string, parameters?: any[]): Promise<any> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in to access this feature.");
  }
  return (await httpsCallable(functions, 'appsScriptEndpoint')({
    functionName,
    parameters
  })).data;
}

// Wrapper functions for Apps Script sheet creation
export async function createBundleSheet(
  campers: CamperAttendeeID[],
  blockActivities: { [blockId: string]: BundleBlockActivities },
  bundleLetter: string
): Promise<string> {
  return callAppsScript('createBundleSheet', [campers, blockActivities, bundleLetter]);
}

export async function createBunkJamboreeSheet(
  bunkNumbers: number[],
  blockActivities: { [blockId: string]: BunkJamboreeBlockActivities }
): Promise<string> {
  return callAppsScript('createBunkJamboreeSheet', [bunkNumbers, blockActivities]);
}

export async function createNonBunkJamboreeSheet(
  campers: CamperAttendeeID[],
  blockActivities: { [blockId: string]: NonBunkJamboreeBlockActivities }
): Promise<string> {
  return callAppsScript('createNonBunkJamboreeSheet', [campers, blockActivities]);
}