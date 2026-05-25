import { CamperAttendee, SchedulingSection } from "@/types/sessions/sessionTypes";
import type momentType from "moment";
import { PreferencesSpreadsheetProperties } from "./features/preferencesSheets/preferencesSheetsProperties";
import { BundleActivity, JamboreeActivity } from "@/types/scheduling/schedulingTypes";

declare global {
  namespace Moment {
    const moment: typeof momentType;
  }
  var moment: typeof momentType

  // features/preferenceSheets/lastModifiedFlags.ts
  var onPreferencesSpreadsheetEdit: (e: GoogleAppsScript.Events.SheetsOnEdit) => void;
  var getLastModifiedTimeBySheetId: (spreadsheetId: string, sheetId: number) => string | null;

  // features/preferenceSheets/preferencesSheets.ts 
  var createPreferencesSpreadsheet: (sessionName: string) => string;
  var addSectionPreferencesSheet: (spreadsheetId: string, section: SchedulingSection) => void;
  var populateCamperAttendeeColumns_: (sheet: GoogleAppsScript.Spreadsheet.Sheet, attendees: CamperAttendee[]) => void;
  var populateBunkAttendeeColumns_: (sheet: GoogleAppsScript.Spreadsheet.Sheet, bunks: number[]) => void;
  var populateBundlePreferencesSheet: (campers: CamperAttendee[], blockActivities: { [blockId: string]: BundleActivity[] }, spreadsheetId: string, sheetId: number) => void;
  var populateBunkJamboreePreferencesSheet: (bunks: number[], blockActivities: { [blockId: string]: JamboreeActivity[] }, spreadsheetId: string, sheetId: number) => void;
  var populateNonBunkJamboreePreferencesSheet: (campers: CamperAttendee[], blockActivities: { [blockId: string]: JamboreeActivity[] }, spreadsheetId: string, sheetId: number) => void;

  // features/preferencesSheets/preferencesSheetsProperties.ts
  var getPreferencesSpreadsheetProperties: (spreadsheetId: string) => PreferencesSpreadsheetProperties;
  var setPreferencesSpreadsheetProperties: (spreadsheetId: string, properties: PreferencesSpreadsheetProperties) => void;

  // features/preferenceSheets/triggers.ts
  var createPreferencesSpreadsheetTrigger: (spreadsheetId: string) => void;

  // utils/properties.ts
  var getScriptProperty: <T>(key: string) => T | null;
  var setScriptProperty: <T>(key: string, value: T) => void;
}
export { };