import { StaffAttendee, CamperAttendee, AdminAttendee } from "@/types/sessions/sessionTypes";
import { BundleSectionSchedule, SectionActivityPreferences } from "@/types/scheduling/schedulingTypes";

export class BundleScheduler {
  bundleNum: number = -1;
  schedule: BundleSectionSchedule | null = null;

  campers: CamperAttendee[] = [];
  staff: StaffAttendee[] = [];
  admins: AdminAttendee[] = [];

  camperPrefs: SectionActivityPreferences | null = null;

  blocksToAssign: string[] = [];

  constructor() { }

  withBundleNum(bundleNum: number): BundleScheduler { this.bundleNum = bundleNum; return this; }

  withSchedule(schedule: BundleSectionSchedule): BundleScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendee[]): BundleScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendee[]): BundleScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendee[]): BundleScheduler { this.admins = admins; return this; }

  withCampersPrefs(campersPrefs: SectionActivityPreferences): BundleScheduler { this.camperPrefs = campersPrefs; return this; }

  forBlocks(blockIds: string[]): BundleScheduler { this.blocksToAssign = blockIds; return this; }

  /*
    Each `programArea` needs a specialized staff member (`StaffAttendeeID`) to be in charge.
    This function assigns all program counselors to all the activities that they need to be present at.
  */
  assignProgramCounselors() { return this; }

  /* Each staff member and admin needs to have 1 period off per day */
  assignPeriodsOff() { return this; }

  /* All OCP campers need to be assigned to 1 OCP chat some time during the bundle */
  assignOcpChats() { return this; }

  /*
    Campers must be assigned to a swim block if any 1 of the following conditions are met:
    - It is the first bundle of the session
    - They are a navigator (NAV) camper
    - They are an OCP camper that has a level < 4 (out of 5)
    - They are an OCP camper that has a level >= 4, but they have opted into having a Swim block
  */
  assignSwimBlocks() { return this; }

  assignCampers() { return this; }

  assignStaff() { return this; }

  assignAdmins() { return this; }
}