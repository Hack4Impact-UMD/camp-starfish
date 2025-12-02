// local interfaces to match preferencesSheets.ts
interface PreferencesSpreadsheetProperties {
  sections: {
    id: string;
  }[];
  //keeps track of when anything on sheet has been modified last
  lastModified?: string; 
}

// access script properties directly 
const props = PropertiesService.getScriptProperties();

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
      const spreadsheetProperties = getPreferencesSpreadsheetProperties(spreadsheetId);
      if (!spreadsheetProperties) { generatePreferencesSheetProperties(spreadsheetId); }

      const existingValue = props.getProperty(spreadsheetId);
      let existingProps: PreferencesSpreadsheetProperties;
      
      if (existingValue) {
        try {
          existingProps = JSON.parse(existingValue);
          // Ensure it has the expected structure
          if (!existingProps || typeof existingProps !== 'object') {
            existingProps = { sections: [] };
          }
          if (!Array.isArray(existingProps.sections)) {
            existingProps.sections = [];
          }
        } catch (parseError) {
          console.warn('Failed to parse existing properties, using defaults:', parseError);
          existingProps = { sections: [] };
        }
      } else {
        existingProps = { sections: [] };
      }
      
      // update the last modified timestamp
      const updatedProps: PreferencesSpreadsheetProperties = {
        sections: existingProps.sections || [],
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
  if (!spreadsheet) {
    console.warn('Could not get spreadsheet from sheet');
    return null;
  }
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
  let propsData: PreferencesSpreadsheetProperties | null = null;
  
  if (propsValue) {
    try {
      const parsed = JSON.parse(propsValue);
      if (parsed && typeof parsed === 'object') {
        propsData = parsed;
      }
    } catch (error) {
      console.warn('Failed to parse preference flags:', error);
    }
  }
  
  return {
    lastModified: (propsData && propsData.lastModified) ? propsData.lastModified : null,
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

// creates an onEdit trigger for the active spreadsheet
//need to remove export keyword when clasp pushing to apps script local project
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
