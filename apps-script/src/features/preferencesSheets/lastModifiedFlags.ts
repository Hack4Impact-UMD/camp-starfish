import { PreferencesSpreadsheetProperties } from "./preferencesSheetsProperties";

/**
 * The event handler triggered when editing the spreadsheet.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedit
 */
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const spreadsheet = sheet.getParent();
    const spreadsheetId = spreadsheet.getId();
    const sheetId = sheet.getSheetId();
    const lastModified = moment().toISOString();

    try {
      let spreadsheetProperties = getPreferencesSpreadsheetProperties(spreadsheetId);
      if (!spreadsheetProperties) { spreadsheetProperties = generatePreferencesSheetProperties(spreadsheetId); }

      const updatedProps: PreferencesSpreadsheetProperties = {
        ...spreadsheetProperties,
        sheets: {
          ...spreadsheetProperties.sheets,
          [sheetId]: { lastModified }
        }
      };
      setPreferencesSpreadsheetProperties(spreadsheetId, updatedProps);

    } catch (error) {
      console.error('Error updating sheet properties:', error);
    }
  } catch (error) {
    console.error('Unexpected error in onEdit:', error);
  }
}

/**
 * Get the last modified timestamp for a specific sheet
 * @param spreadsheetId The ID of the spreadsheet
 * @param sheetId The ID of the sheet
 * @returns The last modified timestamp or null if not found
 */
function getLastModifiedBySheetId(spreadsheetId: string, sheetId: number): string | null {
  const spreadsheetProperties = getPreferencesSpreadsheetProperties(spreadsheetId);
  if (!spreadsheetProperties || !spreadsheetProperties.sheets[sheetId]) {
    return null;
  }
  return spreadsheetProperties.sheets[sheetId].lastModified;
}

globalThis.onEdit = onEdit;
globalThis.getSectionLastModified = getLastModifiedBySheetId;
globalThis.getSectionLastModifiedBySheet = getSectionLastModifiedBySheet;
globalThis.getPreferenceChangeFlags = getPreferenceChangeFlags;
globalThis.getPreferenceChangeFlagsWrapper = getPreferenceChangeFlagsWrapper;
globalThis.createOnEditTriggerForActiveSpreadsheet = createOnEditTriggerForActiveSpreadsheet;
