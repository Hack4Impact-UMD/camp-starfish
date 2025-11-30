
import { BlockActivities, CamperAttendeeID, SchedulingSectionID } from "@/types/sessionTypes";
import type momentType from "moment";
import { PreferencesSpreadsheetProperties } from "./features/preferencesSheets/preferencesSheetsProperties";

declare global {
  namespace Moment {
    const moment: typeof momentType;
  }
  var moment: typeof momentType

  // features/preferenceSheets/preferencesSheets.ts 
  var createPreferencesSpreadsheet: (sessionName: string) => string;
  var addSectionPreferencesSheet: (spreadsheetId: string, section: SchedulingSectionID) => void;
  var populateCamperAttendeeColumns_: (sheet: GoogleAppsScript.Spreadsheet.Sheet, attendees: CamperAttendeeID[]) => void;
  var populateBunkAttendeeColumns_: (sheet: GoogleAppsScript.Spreadsheet.Sheet, bunks: number[]) => void;
  var populateBundlePreferencesSheet: (campers: CamperAttendeeID[], blockActivities: BlockActivities<'BUNDLE'>, spreadsheetId: string, sheetId: number) => void;
  var populateBunkJamboreePreferencesSheet: (bunks: number[], blockActivities: BlockActivities<'BUNK-JAMBO'>, spreadsheetId: string, sheetId: number) => void;
  var populateNonBunkJamboreePreferencesSheet: (campers: CamperAttendeeID[], blockActivities: BlockActivities<'NON-BUNK-JAMBO'>, spreadsheetId: string, sheetId: number) => void;

  // flagscript.ts
  var onEdit: (e: GoogleAppsScript.Events.SheetsOnEdit) => void;
  var getSectionLastModified: (spreadsheetId: string, sheetId: number) => string | null;
  var getSectionLastModifiedBySheet: (sheet: GoogleAppsScript.Spreadsheet.Sheet) => string | null;
  var getPreferenceChangeFlags: (spreadsheetId: string, sheetId: number) => { 
    lastModified: string | null; 
    getSectionLastModified: (id: number) => string | null 
  };
  var getPreferenceChangeFlagsWrapper: (spreadsheetId: string, sheetId: number) => string;
  var createOnEditTrigger: (spreadsheetId: string) => void;
  var createOnEditTriggerForActiveSpreadsheet: () => void;

  // utils/properties.ts
  var getScriptProperty: <T>(key: string) => T | null;
  var setScriptProperty: <T>(key: string, value: T) => void;

  // features/preferencesSheets/preferencesSheetsProperties.ts
  var getPreferencesSpreadsheetProperties: (spreadsheetId: string) => PreferencesSpreadsheetProperties | null;
  var setPreferencesSpreadsheetProperties: (spreadsheetId: string, properties: PreferencesSpreadsheetProperties) => void;
}
export {};