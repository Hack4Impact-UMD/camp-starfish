import { StaffAttendeeID, CamperAttendeeID, ProgramArea, Block, AdminAttendeeID, BundleActivity } from "@/types/sessionTypes";

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

  /*
    Assigns campers to their preferred Bundle  activities for the given block.
    Camper preferences are provided as a mapping of camper ID -> BundleActivtiy.
    Between 4-9 campers for each activtiy, but ideally, it should be 5-8 campers per activity and preference is given to older campers
    Make sure to check for camper-camper conflict in each activity. If there is, give preference to older camper.
  */
  assignCamper<T extends 'BUNDLE'>(blockID: string, camperAttendees: { [camper: string]: BundleActivity }): void {}

  /*
    Assigns staff randomly to each activity in the given block.
    Staff should ideally be in a 1:1 ratio with the number of campers in each activity
    Make sure staff are not scheduled during their period off and make sure to check for staff-staff conflicts.
    Account for the fact that there's staff members that are the program area counselors, so they have to be placed in that activity
  */
  assignStaff<T extends 'BUNDLE'>(staffAttendees: StaffAttendeeID[]): void {}

  /*
    Add admin to adminIds array in IndiviualAssignments for the given activtiy.
    There should be at least 1 admin present at each activity
  */
  assignAdmin<T extends 'BUNDLE'>(blockID: string, adminID: AdminAttendeeID, bundleActivity: BundleActivity): void {}
}