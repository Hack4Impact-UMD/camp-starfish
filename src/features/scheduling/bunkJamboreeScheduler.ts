import {StaffAttendeeID, CamperAttendeeID, ProgramArea, Block, AdminAttendeeID, JamboreeActivity} from "@/types/sessionTypes";

class BunkJamboreeScheduler {
  /*
    Maps a unique block ID (e.g. "A", "B", "C") to its corresponding Block<'BUNK-JAMBO'> object.
    This field will be updated whenever new blocks or activities are added.
  */
  blocks: { [blockId: string]: Block<"BUNK-JAMBO"> } = {};

  alternatePeriodsOff: { [period: string]: number[] } = {};

  /*
    Creates a new BunkJamboreeScheduler. Takes in an initial set of blocks to populate the scheduler.
    May later be updated as additional blocks or activities are added.
  */
  constructor(blocks: { [blockId: string]: Block<"BUNK-JAMBO"> }) {
    this.blocks = blocks;
  }

  /*
    Assigns admins to oversee each bunk for all blocks.
    Admins should be randomly distributed across bunks.
  */
  addAdmins(adminAttendees: AdminAttendeeID[]): void {}

  /*
    Assigns an activity of the bunk's choice to a given block.
  */
  assignActivityToBunk(blockID: string, activity: JamboreeActivity, bunkNumber: number): void {}
}
