import { SchedulingSectionID } from "@/types/sessionTypes";
import type momentType from "moment";

declare global {
  namespace Moment {
    const moment: typeof momentType;
  }
  var moment: typeof momentType

  // preferencesSheets.ts
  var createPreferencesSpreadsheet: (sessionName: string) => string
  var addSectionPreferencesSheet: (spreadsheetId: string, section: SchedulingSectionID) => void

  // declare all Apps Script functions here
  // ex. var functionName(param1: string, param2: nu
  // after the function implementation in a separate file, add the following line
  // globalThis.functionName = functionName;
}

export { };