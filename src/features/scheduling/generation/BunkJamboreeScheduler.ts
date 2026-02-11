import { AdminAttendee, Bunk } from "@/types/sessions/sessionTypes";
import { BunkJamboreeSectionSchedule, SectionActivityPreferences } from "@/types/scheduling/schedulingTypes";

export class BunkJamboreeScheduler {
  schedule: BunkJamboreeSectionSchedule | null = null;

  bunks: Bunk[] = [];
  admins: AdminAttendee[] = [];

  preferences: SectionActivityPreferences | null = null;

  blocksToAssign: string[] = [];

  constructor() { }

  withSchedule(schedule: BunkJamboreeSectionSchedule): BunkJamboreeScheduler { this.schedule = schedule; return this; }

  withBunks(bunks: Bunk[]): BunkJamboreeScheduler { this.bunks = bunks; return this; }

  withAdmins(admins: AdminAttendee[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withPreferences(preferences: SectionActivityPreferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): BunkJamboreeScheduler { return this; }

  assignAdminsToActivities(): BunkJamboreeScheduler { return this; }

  assignBunksToActivities(): BunkJamboreeScheduler { return this; }
}