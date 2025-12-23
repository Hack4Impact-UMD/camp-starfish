import { auth, functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import { CamperAttendeeID, BundleActivityWithAssignments, BunkJamboreeActivityWithAssignments, NonBunkJamboreeActivityWithAssignments } from "@/types/sessionTypes";
import { PermissionDeniedError } from "@/utils/errors/PermissionDeniedError";
/**  
 * Calls an Apps Script function via Firebase callable.  
 * @warning The returned data is not validated against type T at runtime.  
 * Callers should validate the shape of returned data if necessary.  
 */  
async function callAppsScript<T = unknown>(  
  functionName: string, 
  parameters?: unknown[]  
): Promise<T> {  
  const user = auth.currentUser;  
  if (!user) {  
    throw new PermissionDeniedError("You must be logged in to access this feature.");  
  }  
  return (await httpsCallable(functions, 'appsScriptEndpoint')({  
    functionName,  
    parameters  
  })).data as T;  
}  

// wrapper functions for Apps Script sheet creation: one for each type (bundle, bunk jamboree, non-bunk jamboree)

//function for bundle sheet creation
export async function createBundleSheet(
  campers: CamperAttendeeID[],
  blockActivities: { [blockId: string]: BundleActivityWithAssignments[] },
  bundleLetter: string,
  spreadsheetId?: string
): Promise<string> {
  return callAppsScript<string>('createBundleSheet', [campers, blockActivities, bundleLetter, spreadsheetId]);
}

// function for bunk jamboree sheet creation
export async function createBunkJamboreeSheet(
  bunkNumbers: number[],
  blockActivities: { [blockId: string]: BunkJamboreeActivityWithAssignments[] },
  spreadsheetId?: string
): Promise<string> {
  return callAppsScript<string>('createBunkJamboreeSheet', [bunkNumbers, blockActivities, spreadsheetId]);
}

// function for non-bunk jamboree sheet creation (by campers, not limited to bunk)

export async function createNonBunkJamboreeSheet(
  campers: CamperAttendeeID[],
  blockActivities: { [blockId: string]: NonBunkJamboreeActivityWithAssignments[] },
  spreadsheetId?: string
): Promise<string> {
  return callAppsScript<string>('createNonBunkJamboreeSheet', [campers, blockActivities, spreadsheetId]);
}