import { SchedulingSectionID } from "@/types/sessionTypes";

export interface PreferencesSpreadsheetProperties {
  sections: SchedulingSectionID[];
  sheets: {
    [sheetId: number]: {
      lastModified: string;
    }
  }
}

function getPreferencesSpreadsheetProperties(spreadsheetId: string): PreferencesSpreadsheetProperties | null {
  return getScriptProperty<PreferencesSpreadsheetProperties>(spreadsheetId);
}
globalThis.getPreferencesSpreadsheetProperties = getPreferencesSpreadsheetProperties;

function setPreferencesSpreadsheetProperties(spreadsheetId: string, properties: PreferencesSpreadsheetProperties) {
  setScriptProperty<PreferencesSpreadsheetProperties>(spreadsheetId, properties);
}
globalThis.setPreferencesSpreadsheetProperties = setPreferencesSpreadsheetProperties;

function generatePreferencesSheetProperties(spreadsheetId: string): PreferencesSpreadsheetProperties {
  const defaultSPreferencesSpreadsheetProperties: PreferencesSpreadsheetProperties = {
    sections: [],
    sheets: {}
  }
  setPreferencesSpreadsheetProperties(spreadsheetId, defaultSPreferencesSpreadsheetProperties);
  return defaultSPreferencesSpreadsheetProperties
}
globalThis.generatePreferencesSheetProperties = generatePreferencesSheetProperties;