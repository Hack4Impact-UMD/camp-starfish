import { SchedulingSectionID } from "@/types/sessionTypes";

export interface PreferencesSpreadsheetProperties {
  sections: SchedulingSectionID[];
  sheets: {
    [sheetId: number]: {
      lastModified: string;
    }
  }
}

function getPreferencesSpreadsheetProperties(spreadsheetId: string): PreferencesSpreadsheetProperties {
  const spreadsheetProperties = getScriptProperty<PreferencesSpreadsheetProperties>(spreadsheetId);
  if (!spreadsheetProperties) { throw Error(`Preferences spreadsheet properties not found for spreadsheet with id ${spreadsheetId}`) };
  return spreadsheetProperties;
}
globalThis.getPreferencesSpreadsheetProperties = getPreferencesSpreadsheetProperties;

function setPreferencesSpreadsheetProperties(spreadsheetId: string, properties: PreferencesSpreadsheetProperties) {
  setScriptProperty<PreferencesSpreadsheetProperties>(spreadsheetId, properties);
}
globalThis.setPreferencesSpreadsheetProperties = setPreferencesSpreadsheetProperties;