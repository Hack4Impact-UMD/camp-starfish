import {StaffAttendeeID, CamperAttendeeID, ProgramArea, Block, AdminAttendeeID, JamboreeActivity, SectionSchedule, Preferences, Bunk} from "@/types/sessionTypes";

export class BunkJamboreeScheduler {
  schedule: SectionSchedule<"BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  bunks: Bunk[] = [];
  admins: AdminAttendeeID[] = [];

  preferences: Preferences = {};

  blocksToAssign: string[] = [];

  constructor() { return this; }

  withSchedule(schedule: SectionSchedule<"BUNK-JAMBO">): BunkJamboreeScheduler { this.schedule = schedule; return this; }

  withBunks(bunks: Bunk[]): BunkJamboreeScheduler { this.bunks = bunks; return this; }

  withAdmins(admins: AdminAttendeeID[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withPreferences(preferences: Preferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): BunkJamboreeScheduler { return this; }

  assignAdminsToActivities(): BunkJamboreeScheduler { return this; }

  assignBunksToActivities(): BunkJamboreeScheduler { return this; }
}
