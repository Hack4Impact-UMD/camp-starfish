import {
  Block,
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  JamboreeActivity,
} from "@/types/sessionTypes";

class NonBunkJamboreeScheduler {
  /*
    Maps a unique block ID (e.g. "A", "B", "C") to its corresponding Block<'NON-BUNK-JAMBO'> object.
    This field will be updated whenever new blocks or activities are added.
  */
  blocks: { [blockId: string]: Block<"NON-BUNK-JAMBO"> } = {};

  alternatePeriodsOff: { [period: string]: number[] } = {};

  /*
    Creates a new NonBunkJamboreeScheduler. Takes in an initial set of blocks to populate the scheduler.
    May later be updated as additional blocks or activities are added.
  */
  constructor(blocks: { [blockId: string]: Block<"NON-BUNK-JAMBO"> }) {
    this.blocks = blocks;
  }

  /*
    Assigns campers to their preferred Jamboree activities for the given block.
    Camper preferences are provided as a mapping of camper ID -> JamboreeActivity.
    Between 4-9 campers for each activtiy, but ideally, it should be 5-8 campers per activity and preference is given to older campers
    Make sure to check for camper-camper conflict in each activity. If there is, give preference to older camper.
  */
  addCampers(blockID: string, camperAttendees: { [camper: string]: JamboreeActivity }): void {}

  /*
    Assigns staff randomly to each activity in the given block.
    Make sure staff are not scheduled during their period off and make sure to check for staff-staff conflicts.
  */
  addStaff(staffAttendees: StaffAttendeeID[]): void {}

  /*
    Assigns admins to preferences for each activity in the given block.
    Make sure staff are not scheduled during their period off.
  */
  addAdmins(adminAttendees: AdminAttendeeID[]): void {}
}
