import { auth, functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import { CamperAttendeeID, BundleBlockActivities, BunkJamboreeBlockActivities, NonBunkJamboreeBlockActivities } from "@/types/sessionTypes";

async function callAppsScript<T = unknown>(
  functionName: string, 
  parameters?: unknown[]
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in to access this feature.");
  }
  return (await httpsCallable(functions, 'appsScriptEndpoint')({
    functionName,
    parameters
  })).data as T;
}

// wrapper functions for apps script sheet creation
export async function createBundleSheet(
  campers: CamperAttendeeID[],
  blockActivities: { [blockId: string]: BundleBlockActivities },
  bundleLetter: string,
  spreadsheetId?: string
): Promise<string> {
  return callAppsScript<string>('createBundleSheet', [campers, blockActivities, bundleLetter, spreadsheetId]);
}

export async function createBunkJamboreeSheet(
  bunkNumbers: number[],
  blockActivities: { [blockId: string]: BunkJamboreeBlockActivities },
  spreadsheetId?: string
): Promise<string> {
  return callAppsScript<string>('createBunkJamboreeSheet', [bunkNumbers, blockActivities, spreadsheetId]);
}

export async function createNonBunkJamboreeSheet(
  campers: CamperAttendeeID[],
  blockActivities: { [blockId: string]: NonBunkJamboreeBlockActivities },
  spreadsheetId?: string
): Promise<string> {
  return callAppsScript<string>('createNonBunkJamboreeSheet', [campers, blockActivities, spreadsheetId]);
}