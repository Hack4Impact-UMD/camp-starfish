import {
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  JamboreeActivity,
  SectionSchedule,
  Preferences,
} from "@/types/sessionTypes";

export class NonBunkJamboreeScheduler {
  schedule: SectionSchedule<"NON-BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  camperPrefs: Preferences = {};

  blocksToAssign: string[] = [];

  constructor() { return this; }

  withSchedule(schedule: SectionSchedule<"NON-BUNK-JAMBO">): NonBunkJamboreeScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendeeID[]): NonBunkJamboreeScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendeeID[]): NonBunkJamboreeScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): NonBunkJamboreeScheduler { this.admins = admins; return this; }

  withCamperPrefs(camperPrefs: Preferences): NonBunkJamboreeScheduler { this.camperPrefs = camperPrefs; return this; }

  forBlocks(blockIds: string[]): NonBunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): NonBunkJamboreeScheduler { return this; }

  assignCampers(): NonBunkJamboreeScheduler { return this; }

  assignCounselors(): NonBunkJamboreeScheduler { return this; }

  getSchedule(): SectionSchedule<"NON-BUNK-JAMBO"> { return this.schedule; }
}
