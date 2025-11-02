declare global {
  // declare all Apps Script functions here
  // ex. var functionName(param1: string, param2: number): boolean

  // after the function implementation in a separate file, add the following line
  // globalThis.functionName = functionName;
  var onEdit: (e: GoogleAppsScript.Events.SheetsOnEdit) => void;
  var getPreferenceChangeFlags: () => { bundle: boolean; jamboree: boolean };
  var getPreferenceChangeFlagsWrapper: () => { bundle: boolean; jamboree: boolean };
  var createOnEditTrigger: (spreadsheetId: string) => void;
  var getPreferenceChangeFlagMaps: () => { bundle: Record<string, boolean>; jamboree: Record<string, boolean> };
  var createOnEditTriggerForActiveSpreadsheet: () => void;
  var resetPreferenceChangeFlag: (section: 'bundle' | 'jamboree') => void;
  var resetAllPreferenceChangeFlags: () => void;
}
export {};