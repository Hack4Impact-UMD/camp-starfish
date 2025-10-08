// google apps script that creates preference spreadsheets for jamborees and bundles
//importing necessary types
import { CamperAttendeeID } from "../../src/types/sessionTypes";
import { 
  BundleBlockActivities, 
  BunkJamboreeBlockActivities, 
  NonBunkJamboreeBlockActivities 
} from "../../src/types/sessionTypes";

/* attentde types type
non-bunk: use camper IDs 
bunk: bunk numbers 
*/

type AttendeeList = CamperAttendeeID[] | number[];

// Type for block activities - array of activities with name property
type BlockActivities = Array<{ name: string; [key: string]: any }>;

// type for block activities map - maps block letters to lists of activities
type BlockActivitiesMap = {
  [blockId: string]: BlockActivities;
};

// color blocks to use for different blocks on the sheet for design
const BLOCK_COLORS: { [key: string]: string } = {
  'A': '#FF0000', 
  'B': '#FFA500', 
  'C': '#FFFF00', 
  'D': '#00FF00', 
};

/* both NAV and OCP sheets should have the same dimensions and format
*/

//creating actual sheet
function createPreferenceSheet(
  attendees: AttendeeList, //list of attendees (either campers or bunks)
  blockActivities: BlockActivitiesMap, //activities for the given block
  sheetName: string //what the input for the sheet should be
): string {
  // create the main spreadsheet 
  const spreadsheet = SpreadsheetApp.create(sheetName);
  const sheet = spreadsheet.getActiveSheet();
  
  //starting index for columns
  let colIndex = 1;
  const blockIds = Object.keys(blockActivities).sort();
  const totalAttendees = attendees.length;
  
  // setting up first column and then iterating through
  const bunkList = typeof attendees[0] === 'number';
  sheet.getRange(1, colIndex).setValue(bunkList ? "Bunk" : "Camper");
  colIndex++;
  
  // headers for blocks and activities
  for (const blockId of blockIds) {
    const activities = blockActivities[blockId];
    const startCol = colIndex;
    
    //entering information for headers for each block and activities
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      sheet.getRange(1, colIndex).setValue(`${blockId} - ${activity.name}`);
      colIndex++;
    }
    
    // applying sheet background colors
    const endCol = colIndex - 1;
    const blockColor = BLOCK_COLORS[blockId];
    const totalRows = totalAttendees + 1;
    sheet.getRange(1, startCol, totalRows, endCol - startCol + 1).setBackground(blockColor);
  }
  
  //keep track of number of current column
  const currentCol = colIndex - 1;
  
  // fill in attendee data starting in the second column going down the rows
  for (let i = 0; i < attendees.length; i++) {
    const currentAttendee = attendees[i];
    //checking if the attendee is a bunk whole (bunk) or campers indidually (non-bunk)
    if (typeof currentAttendee === 'number') {
      // setting the rows for bunks
      sheet.getRange(i + 2, 1).setValue(currentAttendee);
    } 
    //setting the row for each cmaper
    else if (typeof currentAttendee === 'object' && 'name' in currentAttendee) {
      const currentCamper = currentAttendee as CamperAttendeeID;
      sheet.getRange(i + 2, 1).setValue(`${currentCamper.name.firstName} ${currentCamper.name.lastName}`);
    }
  }
  
  // formatting sheet
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.getRange(1, 1, 1, currentCol).setHorizontalAlignment('center');
  sheet.autoResizeColumns(1, currentCol);
  
  return spreadsheet.getId();
}

//BUNDLE SHEET CREATION
function createBundleSheet(
  campers: CamperAttendeeID[], //list of campers attending
  blockActivities: { [blockId: string]: BundleBlockActivities }, //activities for the given block
  bundleLetter: string //bundle letter
): string {
  return createPreferenceSheet(
    campers,
    blockActivities,
    `Bundle ${bundleLetter} Schedule`
  );
}

//BUNK JAMBOREE SHEET CREATION
function createBunkJamboreeSheet(
  bunkNumbers: number[], //list of bunk numbers attending
  blockActivities: { [blockId: string]: BunkJamboreeBlockActivities } //activities for the given block
): string {
  return createPreferenceSheet(
    bunkNumbers,
    blockActivities,
    "Bunk Jamboree Schedule"
  );
}

//NON-BUNK JAMBOREE SHEET CREATION
function createNonBunkJamboreeSheet(
  campers: CamperAttendeeID[], //campers attending
  blockActivities: { [blockId: string]: NonBunkJamboreeBlockActivities } //activities for the given block
): string {
  return createPreferenceSheet(
    campers,
    blockActivities,
    "Non-Bunk Jamboree Schedule"
  );
}