import { BlockActivities, CamperAttendeeID, SchedulingSectionID } from "@/types/sessionTypes";
import type momentType from "moment";

declare global {
  namespace Moment {
    const moment: typeof momentType;
  }
  var moment: typeof momentType

  // preferencesSheets.ts
  var createPreferencesSpreadsheet: (sessionName: string) => string;
  var addSectionPreferencesSheet: (spreadsheetId: string, section: SchedulingSectionID) => void;
  var populateCamperAttendeeColumns_: (sheet: GoogleAppsScript.Spreadsheet.Sheet, attendees: CamperAttendeeID[]) => void;
  var populateBunkAttendeeColumns_: (sheet: GoogleAppsScript.Spreadsheet.Sheet, bunks: number[]) => void;
  var populateBundlePreferencesSheet: (campers: CamperAttendeeID[], blockActivities: BlockActivities<'BUNDLE'>, spreadsheetId: string, sheetId: number) => void;
  var populateBunkJamboreePreferencesSheet: (bunks: number[], blockActivities: BlockActivities<'BUNK-JAMBO'>, spreadsheetId: string, sheetId: number) => void;
  var populateNonBunkJamboreePreferencesSheet: (campers: CamperAttendeeID[], blockActivities: BlockActivities<'NON-BUNK-JAMBO'>, spreadsheetId: string, sheetId: number) => void;

  // declare all Apps Script functions here
  // ex. var functionName(param1: string, param2: nu
  // after the function implementation in a separate file, add the following line
  // globalThis.functionName = functionName;
}

export { };