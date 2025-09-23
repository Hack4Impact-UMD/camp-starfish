import { StaffAttendeeID, CamperAttendeeID, ProgramArea, Block, BundleBlockActivities, BundleActivity } from "@/types/sessionTypes";

class BundleScheduler {

  // Blocks Field: Maps a unique block ID (letter) to its Block<'BUNDLE'> object
  blocks: { [blockId: string]: Block<'BUNDLE'> } = {};

  constructor(numBlocks: number) {
    /*
      Problem: We don’t know exactly how many blocks will be in each bundle ahead of time. 
      We’ll figure it out by checking the spreadsheet and use that number when creating the bundle.
    
      What this does: Initializes the `blocks` field with `numBlocks` empty blocks.
      Each block is given a letter ID (A, B, C, etc.) for easy reference.
      
      For each Block: 
      `activities` should be set to and empty list of type BundleBlockActivities
      `periodsOff` should be set to an empty list of type number
    */
  }

  // Add `activity` to `activitiesField` in block given by `blockId`
  addActivity (blockId: string, activity: BundleActivity): void {} 

/*
  Each `programArea` needs a staff member (`StaffAttendeeID`) to be in charge.
  This function assigns the given programArea to the corresponding staff member.
*/
  assignProgramAreaCounselor(programArea: ProgramArea, staffID: StaffAttendeeID): void {}

  /*
    Assign a camper (CamperAttendeeID) to the "Teen Chat" activity in the given block.
    Also update the block's`IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignOCPChats<T extends 'BUNDLE'>(camperID: CamperAttendeeID): void {}

  /*
    Assign a camper (CamperAttendeeID) to the "Waterfront" activity in the given block. 
    Also update the block's `IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed*/
  assignSwimmingBlock<T extends 'BUNDLE'>(camperID: CamperAttendeeID): void {}

  assignCamper<T extends 'BUNDLE'>(blockID: string, camperID: CamperAttendeeID, bundleActivity: BundleActivity): void {
    // Add camper to camperIds array in IndiviualAssignments for the given activtiy

  }

  assignStaff<T extends 'BUNDLE'>(blockID: string, staffID: StaffAttendeeID, bundleActivity: BundleActivity): void {
    // Add staff to staffIds array in IndiviualAssignments for the given activtiy
  }

  assignAdmin<T extends 'BUNDLE'>(blockID: string, adminID: StaffAttendeeID, bundleActivity: BundleActivity): void {
    // Add admin to adminIds array in IndiviualAssignments for the given activtiy
  }


}