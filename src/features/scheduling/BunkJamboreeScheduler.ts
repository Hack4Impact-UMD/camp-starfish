import { AdminAttendeeID, SectionSchedule, SectionPreferences, Bunk, BunkID } from "@/types/sessionTypes";

export class BunkJamboreeScheduler {
  schedule: SectionSchedule<"BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  bunks: BunkID[] = [];
  admins: AdminAttendeeID[] = [];

  preferences: SectionPreferences = {};

  blocksToAssign: string[] = [];

  constructor() { }

  withSchedule(schedule: SectionSchedule<"BUNK-JAMBO">): BunkJamboreeScheduler { this.schedule = schedule; return this; }

  withBunks(bunks: BunkID[]): BunkJamboreeScheduler { this.bunks = bunks; return this; }

  withAdmins(admins: AdminAttendeeID[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withPreferences(preferences: SectionPreferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): BunkJamboreeScheduler { return this; }

  assignAdminsToActivities(): BunkJamboreeScheduler { return this; }

  assignBunksToActivities(): BunkJamboreeScheduler { return this; }
}
