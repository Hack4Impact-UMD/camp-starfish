// google apps script that creates preference spreadsheets for jamborees and bundles
// importing necessary types to use in spreadsheet
import { CamperAttendeeID } from "../../src/types/sessionTypes";
import { 
  BundleBlockActivities, 
  BunkJamboreeBlockActivities, 
  NonBunkJamboreeBlockActivities 
} from "../../src/types/sessionTypes";

/* attendee types type
non-bunk: use camper IDs 
bunk: bunk numbers 
*/

// keeps track of attendee ID, name, and bunk for the spread sheet
//minimize amount of data passed in
type AttendeeList = Pick<CamperAttendeeID, 'id' | 'name' | 'bunk'>[] | number[];

// type for block activities - array of activities with name property
type BlockActivities = Array<{ name: string }>;  

// type for block activities map - maps block letters to lists of activities
type BlockActivitiesMap = {
  [blockId: string]: BlockActivities;
};

// color blocks to use for different blocks on the sheet for design
const BLOCK_COLORS: { [key: string]: string } = {
  'A': '#ea9999',  
  'B': '#f9cb9c',  
  'C': '#ffe599', 
  'D': '#b6d7a8',  
};

/* both NAV and OCP sheets should have the same dimensions and format
*/

/**  
 * Creates a preference sheet for jamborees or bundles.  
 * @param {AttendeeList} attendees - List of attendees (camper objects or bunk numbers)  
 * @param {BlockActivitiesMap} blockActivities - Activities organized by block ID  
 * @param {string} sheetName - Name for the created spreadsheet  
 * @returns {string} The ID of the created spreadsheet  
 */  

// creating actual sheet
function createPreferenceSheet(
  attendees: AttendeeList, // list of attendees (either campers or bunks)
  blockActivities: BlockActivitiesMap, // activities for the given block
  sheetName: string // what the input for the sheet should be
): string {
  // create the main spreadsheet 
  const spreadsheet = SpreadsheetApp.create(sheetName);
  const sheet = spreadsheet.getActiveSheet();
  
  // starting index for columns
  let colIndex = 1;
  const blockIds = Object.keys(blockActivities).sort();
  const totalAttendees = attendees.length;
  const isBunkList = typeof attendees[0] === 'number';

  //checking if there are attendees present in input
  if (attendees.length === 0) {  
    throw new Error("Attendees array cannot be empty");  
  }  
  
  // set up columns: for camper-based sheets, add both "Bunk" and "Campers" columns
  // for bunk-based sheets, only add "Bunk" column
  if (!isBunkList) {
    sheet.getRange(1, colIndex).setValue("Bunk");
    colIndex++;
    sheet.getRange(1, colIndex).setValue("Campers");
    colIndex++;
  } else {
    sheet.getRange(1, colIndex).setValue("Bunk");
    colIndex++;
  }
  
  // creating headers for blocks and activities
  for (const blockId of blockIds) {
    const activities = blockActivities[blockId];
    const startCol = colIndex;
    
    // create block header spanning all activities in this block
    const numActivities = activities.length;
    if (numActivities > 0) {
      sheet.getRange(1, startCol, 1, numActivities).merge();
      sheet.getRange(1, startCol).setValue(`Block ${blockId}`);
      sheet.getRange(1, startCol).setHorizontalAlignment('center');
      sheet.getRange(1, startCol).setFontWeight('bold');
    }
    
    // entering information for headers for each activity
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
  
  // keep track of number of current column
  const currentCol = colIndex - 1;
  
  // fill in attendee data
  for (let i = 0; i < attendees.length; i++) {
    const currentAttendee = attendees[i];
    const rowIndex = i + 3; // start at row 3 (after two header rows)

    
    // checking if the attendee is a bunk number (bunk jamboree) or campers individually (non-bunk)
    if (typeof currentAttendee === 'number') {
      // setting the rows for bunks
      sheet.getRange(rowIndex, 1).setValue(currentAttendee);
    } 
    // setting the row for each camper
    else if (typeof currentAttendee === 'object' && 'name' in currentAttendee) {
      const currentCamper = currentAttendee as CamperAttendeeID;
      // set bunk number in column 1
      sheet.getRange(rowIndex, 1).setValue(currentCamper.bunk || '');
      // set camper name in column 2
      sheet.getRange(rowIndex, 2).setValue(`${currentCamper.name.firstName} ${currentCamper.name.lastName}`);
    }
  }
  
  // formatting sheet
  sheet.setFrozenRows(2); // freeze both header rows
  sheet.setFrozenColumns(isBunkList ? 1 : 2); // freeze bunk column(s)
  sheet.getRange(1, 1, 2, currentCol).setHorizontalAlignment('center');
  sheet.getRange(1, 1, 2, currentCol).setFontWeight('bold');
  sheet.autoResizeColumns(1, currentCol);
  
  return spreadsheet.getId();
}

/**  
 * Creates a preference sheet for a bundle schedule.  
 * @param {CamperAttendeeID[]} campers - List of campers attending the bundle  
 * @param {{ [blockId: string]: BundleBlockActivities }} blockActivities - Activities for each block  
 * @param {string} bundleLetter - Letter identifier for the bundle (e.g., 'A', 'B')  
 * @returns {string} The ID of the created spreadsheet  
 */  
// bundle sheet creation
function createBundleSheet(
  campers: CamperAttendeeID[], // list of campers attending
  blockActivities: { [blockId: string]: BundleBlockActivities }, // activities for the given block
  bundleLetter: string // bundle letter
): string {
  return createPreferenceSheet(
    campers,
    blockActivities,
    `Bundle ${bundleLetter} Schedule`
  );
}

/**  
+ * Creates a preference sheet for a bunk-based jamboree schedule.  
+ * @param {number[]} bunkNumbers - List of bunk numbers attending  
+ * @param {{ [blockId: string]: BunkJamboreeBlockActivities }} blockActivities - Activities for each block  
+ * @returns {string} The ID of the created spreadsheet  
+ */  
// bunk jamboree sheet creation
function createBunkJamboreeSheet(
  bunkNumbers: number[], // list of bunk numbers attending
  blockActivities: { [blockId: string]: BunkJamboreeBlockActivities } // activities for the given block
): string {
  return createPreferenceSheet(
    bunkNumbers,
    blockActivities,
    "Bunk Jamboree Schedule"
  );
}

/**  
 * Creates a preference sheet for a non-bunk (individual) jamboree schedule.  
 * @param {CamperAttendeeID[]} campers - List of campers attending  
 * @param {{ [blockId: string]: NonBunkJamboreeBlockActivities }} blockActivities - Activities for each block  
 * @returns {string} The ID of the created spreadsheet  
 */  

// non-bunk jamboree sheet creation
function createNonBunkJamboreeSheet(
  campers: CamperAttendeeID[], // campers attending
  blockActivities: { [blockId: string]: NonBunkJamboreeBlockActivities } // activities for the given block
): string {
  return createPreferenceSheet(
    campers,
    blockActivities,
    "Non-Bunk Jamboree Schedule"
  );
}