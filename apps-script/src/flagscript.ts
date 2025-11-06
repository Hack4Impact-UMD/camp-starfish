// local interfaces to match preferencesSheets.ts
interface PreferencesSpreadsheetProperties {
  sections: {
    id: string;
  }[];
  //keeps track of when anything on sheet has been modified last
  lastModified?: string; 
}
 
// access information about the active spreadsheet and use its id as the key
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const spreadsheetId = spreadsheet.getId();

// access script properties directly 
const props = PropertiesService.getScriptProperties();

/**
 * The event handler triggered when editing the spreadsheet.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedit
 */
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  try {
    if (!e?.range) {
      console.warn('Invalid edit event received:', e);
      return;
    }
    
    const range = e.range;
    const sheet = range.getSheet();
    if (!sheet) {
      console.warn('Could not get sheet from range');
      return;
    }
    
    const sheetId = sheet.getSheetId();
    const lastModified = moment().toISOString();
    
    try {
      // get existing properties or initialize if they don't exist
      const existingValue = props.getProperty(spreadsheetId);
      const existingProps: PreferencesSpreadsheetProperties = existingValue 
        ? JSON.parse(existingValue) 
        : { sections: [] };
      
      // update the last modified timestamp
      const updatedProps = {
        ...existingProps,
        lastModified: moment().toISOString()
      };
      
      // save back to properties
      props.setProperty(spreadsheetId, JSON.stringify(updatedProps));
      
      // set a flag indicating preferences have changed
      props.setProperty(`PREF_CHANGED_${spreadsheetId}`, 'true');
      
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
function getSectionLastModified(spreadsheetId: string, sheetId: number): string | null {
  return props.getProperty(`SHEET_${spreadsheetId}_${sheetId}_LAST_MODIFIED`);
}

/**
 * Get the last modified timestamp for a specific sheet object
 * @param sheet The sheet to get the last modified time for
 * @returns The last modified timestamp or null if not found
 */
function getSectionLastModifiedBySheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): string | null {
  const spreadsheet = sheet.getParent();
  return getSectionLastModified(spreadsheet.getId(), sheet.getSheetId());
}

/**
 * Get preference change flags for a specific section
 * @param spreadsheetId The ID of the spreadsheet
 * @param sheetId The ID of the sheet
 * @returns An object containing the last modified timestamp and a helper function
 */
function getPreferenceChangeFlags(spreadsheetId: string, sheetId: number) {
  const propsValue = props.getProperty(spreadsheetId);
  const propsData: PreferencesSpreadsheetProperties | null = propsValue ? JSON.parse(propsValue) : null;
  return {
    lastModified: propsData?.lastModified || null,
    getSectionLastModified: (id: number) => getSectionLastModified(spreadsheetId, id)
  };
}

/**
 * Wrapper function to get preference change flags as a JSON string
 * @param spreadsheetId The ID of the spreadsheet
 * @param sheetId The ID of the sheet
 * @returns A JSON string of the preference change flags
 */
function getPreferenceChangeFlagsWrapper(spreadsheetId: string, sheetId: number): string {
  return JSON.stringify(getPreferenceChangeFlags(spreadsheetId, sheetId));
}

// creates an onEdit trigger for a specific spreadsheet
function createOnEditTrigger(spreadsheetId: string): void {
  const exists = ScriptApp.getProjectTriggers().some(
    (t) =>
      t.getHandlerFunction() === "onEdit" &&
      t.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      t.getEventType() === ScriptApp.EventType.ON_EDIT &&
      t.getTriggerSourceId() === spreadsheetId
  );
  
  if (!exists) {
    ScriptApp.newTrigger("onEdit")
      .forSpreadsheet(spreadsheetId)
      .onEdit()
      .create();
  }
}

// creates an onEdit trigger for the active spreadsheet
export function createOnEditTriggerForActiveSpreadsheet(): void {
  const ss = SpreadsheetApp.getActive();
  if (!ss) return;
  createOnEditTrigger(ss.getId());
}

globalThis.onEdit = onEdit;
globalThis.getSectionLastModified = getSectionLastModified;
globalThis.getSectionLastModifiedBySheet = getSectionLastModifiedBySheet;
globalThis.getPreferenceChangeFlags = getPreferenceChangeFlags;
globalThis.getPreferenceChangeFlagsWrapper = getPreferenceChangeFlagsWrapper;
globalThis.createOnEditTrigger = createOnEditTrigger;
globalThis.createOnEditTriggerForActiveSpreadsheet = createOnEditTriggerForActiveSpreadsheet;
