import {
  AdminAttendee,
  StaffAttendee,
  CamperAttendee,
} from "@/types/sessions/sessionTypes";
import { SectionActivityPreferences, NonBunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypes";

export class NonBunkJamboreeScheduler {
  schedule: NonBunkJamboreeSectionSchedule | null = null;

  campers: CamperAttendee[] = [];
  staff: StaffAttendee[] = [];
  admins: AdminAttendee[] = [];

  camperPrefs: SectionActivityPreferences | null = null;

  blocksToAssign: string[] = [];

  constructor() { }

  withSchedule(schedule: NonBunkJamboreeSectionSchedule): NonBunkJamboreeScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendee[]): NonBunkJamboreeScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendee[]): NonBunkJamboreeScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendee[]): NonBunkJamboreeScheduler { this.admins = admins; return this; }

  withCamperPrefs(camperPrefs: SectionActivityPreferences): NonBunkJamboreeScheduler { this.camperPrefs = camperPrefs; return this; }

  forBlocks(blocks: string[]): NonBunkJamboreeScheduler { this.blocksToAssign = blocks; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): NonBunkJamboreeScheduler { return this; }

  assignCampers(): NonBunkJamboreeScheduler { return this; }

  assignCounselors(): NonBunkJamboreeScheduler { return this; }

  getSchedule(): NonBunkJamboreeSectionSchedule {
    if (!this.schedule) {
      throw new Error("Schedule not set");
    }
    return this.schedule;
  }
}