import { PreferencesSpreadsheetProperties } from "./preferencesSheetsProperties";

/**
 * The event handler triggered when editing the spreadsheet.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedit
 */
function onPreferencesSpreadsheetEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const spreadsheet = sheet.getParent();
    const spreadsheetId = spreadsheet.getId();
    const sheetId = sheet.getSheetId();
    const lastModified = moment().toISOString();

    try {
      const spreadsheetProperties = getPreferencesSpreadsheetProperties(spreadsheetId);
      const updatedProperties: PreferencesSpreadsheetProperties = {
        ...spreadsheetProperties,
        sheets: {
          ...spreadsheetProperties.sheets,
          [sheetId]: { lastModified }
        }
      };
      setPreferencesSpreadsheetProperties(spreadsheetId, updatedProperties);

    } catch (error) {
      console.error('Error updating sheet properties:', error);
    }
  } catch (error) {
    console.error('Unexpected error in onEdit:', error);
  }
}
globalThis.onPreferencesSpreadsheetEdit = onPreferencesSpreadsheetEdit;

/**
 * Get the last modified timestamp for a specific sheet
 * @param spreadsheetId The ID of the spreadsheet
 * @param sheetId The ID of the sheet
 * @returns The last modified timestamp or null if not found
 */
function getLastModifiedTimeBySheetId(spreadsheetId: string, sheetId: number): string | null {
  const spreadsheetProperties = getPreferencesSpreadsheetProperties(spreadsheetId);
  if (!spreadsheetProperties || !spreadsheetProperties.sheets[sheetId]) {
    return null;
  }
  return spreadsheetProperties.sheets[sheetId].lastModified;
}
globalThis.getLastModifiedTimeBySheetId = getLastModifiedTimeBySheetId;