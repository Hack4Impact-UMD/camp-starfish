//importing types to use for data inputs and use in sheet
import { Camper } from "../../src/types/personTypes";
import { Bunk } from "../../src/types/sessionTypes";
// google app script that creates spreadsheets for jamborees and bundles

function createJambooreeSheet(bunkJambo: Camper [], nonBunkJambo: Bunk [] ){
    //two sheets for each bundle letter (A, B, C, D)
    //two sheets should have the same design/layout
    //creating NAV sheet
    const navSheet = SpreadsheetApp.create("NAV Sheet");
    //creating OCP sheet
    const ocpSheet = SpreadsheetApp.create("OCP Sheet");
    
    //getting the dimensions of the sheets
    /* get number of navs, get number of bunks, get number of ocps */
    //want to add make rows = number of campers in the jamboree + 1 for block letter + 1 for activity number
    //want to make columns = number of activitys * number of blocks + 1 for bunk + 1 for camper numbers

    //inputting data
    /* 1. go through each list and place them into sheet (if they are in the right age group)
       2. check preference for each activity (1-5 in that order) and place that number in the column then continue to next activity
     */

    //setting colors for different bundles
        /* set range with given columns then color */

    //block a color = red

    //block b color = orange

    //block c color = yellow

    //block d color = green

    //each block has 5 columns (5 activities)
}