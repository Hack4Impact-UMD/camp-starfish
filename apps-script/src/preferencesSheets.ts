// google apps script that creates preference spreadsheets for jamborees and bundles
// importing necessary types to use in spreadsheet
import { AgeGroup, BlockActivities, BundleID, BunkJamboree, BunkJamboreeID, CamperAttendeeID, NonBunkJamboreeID, SchedulingSectionID } from "../../src/types/sessionTypes";
import { getFullName } from "@/utils/personUtils";

// color blocks to use for different blocks on the sheet for design
const BLOCK_COLORS: { [key: string]: string } = {
  'A': '#ea9999',
  'B': '#f9cb9c',
  'C': '#ffe599',
  'D': '#b6d7a8',
};

interface PreferencesSpreadsheetProperties {
  sections: Omit<SchedulingSectionID, 'sessionId'>[];
}

function setScriptProperty<T>(key: string, value: T) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(value));
}

function getScriptProperty<T>(key: string): T | null {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  return value ? JSON.parse(value) : null;
}

function getPreferencesSpreadsheetProperties(spreadsheetId: string): PreferencesSpreadsheetProperties | null {
  return getScriptProperty<PreferencesSpreadsheetProperties>(spreadsheetId);
}

function setPreferencesSpreadsheetProperties(spreadsheetId: string, properties: PreferencesSpreadsheetProperties) {
  setScriptProperty<PreferencesSpreadsheetProperties>(spreadsheetId, properties);
}

function createPreferencesSpreadsheet(sessionName: string): string {
  const spreadsheet = SpreadsheetApp.create(sessionName);
  const sheet = spreadsheet.getSheets()[0];
  // TODO: re-enable when syncing update operations in Firestore with prefs spreadsheet
  //sheet.deleteRows(1, sheet.getMaxRows() - 1);
  //sheet.deleteColumns(1, sheet.getMaxColumns() - 1);
  sheet.getRange('A1').setValue("No sections yet!\nAdd campers and scheduling sections at https://camp-starfish.web.app")
  setPreferencesSpreadsheetProperties(spreadsheet.getId(), { sections: [] })
  return spreadsheet.getId();
}
globalThis.createPreferencesSpreadsheet = createPreferencesSpreadsheet;

function addSectionPreferencesSheet(spreadsheetId: string, section: SchedulingSectionID): void {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let spreadsheetProperties = getPreferencesSpreadsheetProperties(spreadsheetId);

  let sections = spreadsheetProperties ? spreadsheetProperties.sections : [];
  let sheet: GoogleAppsScript.Spreadsheet.Sheet;
  if (sections.length === 0) {
    sheet = spreadsheet.getSheets()[0];
    sections.push(section);
  } else {
    let sheetIndex = sections.findIndex(s => moment(section.startDate).isBefore(s.startDate));
    if (sheetIndex === -1) { sheetIndex = sections.length; }
    sheet = spreadsheet.insertSheet(sheetIndex);
  }
  sheet.setName(section.name);
  setPreferencesSpreadsheetProperties(spreadsheetId, { sections });
}
globalThis.addSectionPreferencesSheet = addSectionPreferencesSheet;

function populateCamperAttendeeColumns_(sheet: GoogleAppsScript.Spreadsheet.Sheet, attendees: CamperAttendeeID[]) {
  sheet.getRange("A1").setValue("Bunk");
  sheet.getRange("B1").setValue("Camper");

  const campersByBunk: { [bunkNum: number]: CamperAttendeeID[] } = {};
  for (const attendee of attendees) {
    if (!campersByBunk[attendee.bunk]) {
      campersByBunk[attendee.bunk] = [];
    }
    campersByBunk[attendee.bunk].push(attendee);
  }

  let row = 3;
  for (const bunkNum of Object.keys(campersByBunk).map(bunkNum => Number(bunkNum)).sort()) {
    const bunkCampers = campersByBunk[bunkNum].sort((a, b) => {
      const compareNameResult = getFullName(a).localeCompare(getFullName(b));
      if (compareNameResult === 0) {
        return a.id - b.id;
      }
      return compareNameResult;
    });
    sheet.getRange(row, 1, row + bunkCampers.length - 1, 1).setValue(`Bunk ${bunkNum}`)
    bunkCampers.forEach((camper, i) => {
      sheet.getRange(`A${row + i}`).setValue(`${getFullName(camper)} (ID: ${camper.id})`);
    })
    row += bunkCampers.length;
  }
}
globalThis.populateCamperAttendeeColumns_ = populateCamperAttendeeColumns_;

function populateBunkAttendeeColumns_(sheet: GoogleAppsScript.Spreadsheet.Sheet, bunks: number[]) {
  sheet.getRange("A1").setValue("Bunk");
  sheet.getRange("B1").setValue("Camper");
  bunks.sort().forEach((bunkNum, i) => {
    sheet.getRange(`A${i + 3}`).setValue(`Bunk ${bunkNum}`);
  })
}
globalThis.populateBunkAttendeeColumns_ = populateBunkAttendeeColumns_;

function populateBundlePreferencesSheet(campers: CamperAttendeeID[], blockActivities: BlockActivities<'BUNDLE'>, spreadsheetId: string, sheetId: number) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetById(sheetId);
  if (!sheet) {
    throw Error("Specified sheet doesn't exist");
  }

  populateCamperAttendeeColumns_(sheet, campers);

  let colIndex = 3;
  const blockIds = Object.keys(blockActivities).sort();
  for (const blockId of blockIds) {
    const activities = blockActivities[blockId];
    const startCol = colIndex;

    // block header
    const numActivities = activities.length;
    if (numActivities > 0) {
      sheet.getRange(1, startCol, 1, numActivities).merge().setValue(`Block ${blockId}`).setHorizontalAlignment('center').setFontWeight('bold');
    }

    // activity headers
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      sheet.getRange(2, colIndex).setValue(`${activity.programArea.name}: ${activity.name}`);
      colIndex++;
    }

    // applying sheet background colors to the entire block
    const endCol = colIndex - 1;
    const blockColor = BLOCK_COLORS[blockId];
    const totalRows = campers.length + 2; // +2 for header rows formatting
    sheet.getRange(1, startCol, totalRows, endCol - startCol + 1).setBackground(blockColor);
  }

  sheet.setFrozenRows(2); // freeze both header rows
  sheet.setFrozenColumns(2); // freeze bunk column(s)
}
globalThis.populateBundlePreferencesSheet = populateBundlePreferencesSheet;

function populateBunkJamboreePreferencesSheet(bunks: number[], blockActivities: BlockActivities<'BUNK-JAMBO'>, spreadsheetId: string, sheetId: number) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetById(sheetId);
  if (!sheet) {
    throw Error("Specified sheet doesn't exist");
  }

  populateBunkAttendeeColumns_(sheet, bunks);

  let colIndex = 2;
  const blockIds = Object.keys(blockActivities).sort();
  const totalAttendees = bunks.length;

  for (const blockId of blockIds) {
    const activities = blockActivities[blockId];
    const startCol = colIndex;

    // block header
    const numActivities = activities.length;
    if (numActivities > 0) {
      sheet.getRange(1, startCol, 1, numActivities).merge().setValue(`Block ${blockId}`).setHorizontalAlignment('center').setFontWeight('bold');
    }

    // activity headers
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      sheet.getRange(2, colIndex).setValue(activity.name);
      colIndex++;
    }

    // applying sheet background colors to the entire block
    const endCol = colIndex - 1;
    const blockColor = BLOCK_COLORS[blockId];
    const totalRows = totalAttendees + 2; // +2 for header rows formatting
    sheet.getRange(1, startCol, totalRows, endCol - startCol + 1).setBackground(blockColor);
  }

  sheet.setFrozenRows(2); // freeze both header rows
  sheet.setFrozenColumns(2); // freeze bunk column(s)
}
globalThis.populateBunkJamboreePreferencesSheet = populateBunkJamboreePreferencesSheet;

function populateNonBunkJamboreePreferencesSheet(campers: CamperAttendeeID[], blockActivities: BlockActivities<'NON-BUNK-JAMBO'>, spreadsheetId: string, sheetId: number) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetById(sheetId);
  if (!sheet) {
    throw Error("Specified sheet doesn't exist");
  }

  populateCamperAttendeeColumns_(sheet, campers);

  let colIndex = 3;
  const blockIds = Object.keys(blockActivities).sort();
  const totalAttendees = campers.length;

  for (const blockId of blockIds) {
    const activities = blockActivities[blockId];
    const startCol = colIndex;

    // block header
    const numActivities = activities.length;
    if (numActivities > 0) {
      sheet.getRange(1, startCol, 1, numActivities).merge().setValue(`Block ${blockId}`).setHorizontalAlignment('center').setFontWeight('bold');
    }

    // activity headers
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      sheet.getRange(2, colIndex).setValue(activity.name);
      colIndex++;
    }

    // applying sheet background colors to the entire block
    const endCol = colIndex - 1;
    const blockColor = BLOCK_COLORS[blockId];
    const totalRows = totalAttendees + 2; // +2 for header rows formatting
    sheet.getRange(1, startCol, totalRows, endCol - startCol + 1).setBackground(blockColor);
  }

  sheet.setFrozenRows(2); // freeze both header rows
  sheet.setFrozenColumns(2); // freeze bunk column(s)
}
globalThis.populateNonBunkJamboreePreferencesSheet = populateNonBunkJamboreePreferencesSheet;