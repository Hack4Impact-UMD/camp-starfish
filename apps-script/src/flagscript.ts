//onEdit() method that runs automatically when a user changes the value of any cell in a spreadsheet
/**
 * The event handler triggered when editing the spreadsheet.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedit
 */
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
  try {
    // basic validation
    if (!e || !e.range) {
      console.warn('Invalid edit event received:', e);
      return;
    }

    const range = e.range;
    
    // safely get sheet name with null checks
    let sheetName = '';
    try {
      const sheet = range.getSheet();
      if (!sheet) {
        console.warn('Could not get sheet from range');
        return;
      }
      sheetName = sheet.getName().toLowerCase();
    } catch (error) {
      console.error('Error accessing sheet:', error);
      return;
    }

    // safely get cell value
    let value = '';
    try {
      const cellValue = range.getValue();
      value = String(cellValue || '').toLowerCase().trim();
    } catch (error) {
      console.error('Error reading cell value:', error);
      return;
    }

    // determine section
    let section = '';
    if (sheetName.includes('bundle') || value === 'bundle') {
      section = 'bundle';
    } else if (sheetName.includes('jamboree') || value === 'jamboree') {
      section = 'jamboree';
    } else {
      return; 
    }

    // update last modified note
    try {
      range.setNote('Last modified: ' + new Date().toISOString());
    } catch (error) {
      console.warn('Could not update cell note:', error);
      // continue execution even if note can't be set
    }

    // update document properties
    const props = PropertiesService.getDocumentProperties();
    if (!props) {
      console.error('Document properties service is not available');
      return;
    }

    const key = `PREF_CHANGED_${section.toUpperCase()}`;
    
    try {
      if (props.getProperty(key) !== 'true') {
        props.setProperty(key, 'true');
      }
    } catch (error) {
      console.error(`Failed to update property ${key}:`, error);
    }
  } catch (error) {
    console.error('Unexpected error in onEdit:', error);
    // don't rethrow to prevent Google Apps Script from showing error to users
  }
}

//returning the preference change flags as an object
function getPreferenceChangeFlags() {
  const props = PropertiesService.getDocumentProperties();
  return {
    bundle: props.getProperty('PREF_CHANGED_BUNDLE') === 'true',
    jamboree: props.getProperty('PREF_CHANGED_JAMBOREE') === 'true',
  };
}

function getPreferenceChangeFlagsWrapper() {
  return JSON.stringify(getPreferenceChangeFlags());
}

// resets preference change flags for a specific section
export function resetPreferenceChangeFlag(section: "bundle" | "jamboree"): void {
  const props = PropertiesService.getDocumentProperties();
  const key = "PREF_CHANGED_" + section.toUpperCase();
  props.setProperty(key, "false");
}

// resets all preference change flags
export function resetAllPreferenceChangeFlags(): void {
  const props = PropertiesService.getDocumentProperties();
  props.setProperty("PREF_CHANGED_BUNDLE", "false");
  props.setProperty("PREF_CHANGED_JAMBOREE", "false");
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

// global exports for Google Apps Script
declare const global: any;
global.onEdit = onEdit;
global.getPreferenceChangeFlags = getPreferenceChangeFlags;
global.getPreferenceChangeFlagsWrapper = getPreferenceChangeFlagsWrapper;
global.resetPreferenceChangeFlag = resetPreferenceChangeFlag;
global.resetAllPreferenceChangeFlags = resetAllPreferenceChangeFlags;
global.createOnEditTrigger = createOnEditTrigger;
global.createOnEditTriggerForActiveSpreadsheet = createOnEditTriggerForActiveSpreadsheet;
