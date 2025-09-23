import { StaffAttendeeID, CamperAttendeeID, ProgramArea, Block, BundleBlockActivities, BundleActivity } from "@/types/sessionTypes";

class BundleScheduler {

  /** 
   * Maps a unique block ID (e.g. "A", "B", "C") to its corresponding Block<'BUNDLE'> object.
   * This field will be updated whenever new blocks or activities are added.
   */
  blocks: { [blockId: string]: Block<'BUNDLE'> } = {};

  alternatePeriodsOff: { [period: string]: number[] } = {};

  /**
   * Creates a new BundleScheduler. Takes in an initial set of blocks to populate the scheduler.
   * May later be updated as additional blocks or activities are added.
   */
  constructor(blocks: { [blockId: string]: Block<'BUNDLE'> }) {
    this.blocks = blocks;
  }

  /*
    Adds a new block to the blocks map with the blockID as the key. 
    The block's `activities` field should be set to empty BundleBlockActivities[] array
  */
  addBlock(blockID: string, block: Block<'BUNDLE'>): void {}

  // Removes the block with the given blockID from the blocks map
  removeBlock(blockID: string): void {}

  // Updates the block with the given blockID in the blocks map
  updateBlock(blockID: string, block: Block<'BUNDLE'>): void {}

  // Adds a new activity to the block with the given blockID
  addActivity(blockID: string, activity: BundleActivity): void {}

  // Removes the activity from the block with the given blockID
  removeActivity(blockID: string, activity: BundleActivity): void {}

  // Updates the activity in the block with the given blockID
  updateActivity(blockID: string, activity: BundleActivity): void {}

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
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignSwimmingBlock<T extends 'BUNDLE'>(camperID: CamperAttendeeID): void {}

  // Add camper to camperIds array in IndiviualAssignments for the given activtiy
  assignCamper<T extends 'BUNDLE'>(blockID: string, camperID: CamperAttendeeID, bundleActivity: BundleActivity): void {}

  // Add staff to staffIDs array in IndiviualAssignments for the given activtiy
  assignStaff<T extends 'BUNDLE'>(blockID: string, staffID: StaffAttendeeID, bundleActivity: BundleActivity): void {}

  // Add admin to adminIds array in IndiviualAssignments for the given activtiy
  assignAdmin<T extends 'BUNDLE'>(blockID: string, adminID: StaffAttendeeID, bundleActivity: BundleActivity): void {}
}