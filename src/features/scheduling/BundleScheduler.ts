import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SectionPreferences, BundleActivity } from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";

export class BundleScheduler {
  bundleNum: number = -1;
  schedule: SectionSchedule<'BUNDLE'> = { blocks: {}, alternatePeriodsOff: {} };

  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  camperPrefs: SectionPreferences = {};

  blocksToAssign: string[] = [];

  constructor() { }

  withBundleNum(bundleNum: number): BundleScheduler { this.bundleNum = bundleNum; return this; }

  withSchedule(schedule: SectionSchedule<'BUNDLE'>): BundleScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendeeID[]): BundleScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendeeID[]): BundleScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): BundleScheduler { this.admins = admins; return this; }

  withCampersPrefs(campersPrefs: SectionPreferences): BundleScheduler { this.camperPrefs = campersPrefs; return this; }

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

	// Assigns campers to their preferred Bundle activities for the given block
  assignCampers<T extends 'BUNDLE'>(blockID: string, camperAttendees: { [camperID: string]: BundleActivity}): void{

    if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

    const activities = this.schedule.blocks[blockID].activities;
    const unassignedCampers: string[] = [];
    const camperIdStrToCamper : { [camperID: string]: CamperAttendeeID } = {};
    const dob : { [camperID: string]: number } = {};
    for (const c of this.campers){
      camperIdStrToCamper[c.id.toString()] = c;
      dob[c.id.toString()] = (new Date(c.dateOfBirth)).getTime();
    }

    // Sort campers by age, oldest first
    const sortedCampers = Object.keys(camperAttendees)
      .sort((a, b) => {
        const diff = dob[a] - dob[b];
        return diff !== 0 ? diff : camperIdStrToCamper[a].id - camperIdStrToCamper[b].id;
    });

    // Try to assign each camper to their preferred activity
    for (const camperIdStr of sortedCampers) {

      const camper = camperIdStrToCamper[camperIdStr];
      const preferredActivity = camperAttendees[camperIdStr];

      // Get the preferred activity, ensuring age group matches
      const activity = activities.find(act => act.name === preferredActivity.name && act.ageGroup === camper.ageGroup);

      // Flag camper as unassigned if the activity doesn't exist, doesn't have space, or there is a camper-camper conflict
      if (!activity || activity.assignments.camperIds.length >= 9 || doesConflictExist(camper, activity.assignments.camperIds)) {
        unassignedCampers.push(camperIdStr);
        return;
      }

      activity.assignments.camperIds.push(camper.id);
    }

    // List of activities as indices of the activities array, sorted by camper count 
    // Could use a min-heap, if needed
    const actIndicesByCamperCount: number[] = activities
      .map((activity, index) => index)
      .sort((a, b) => activities[a].assignments.camperIds.length - activities[b].assignments.camperIds.length);

    // Assign unassigned campers, first to activities with the least number of campers
    // Assumes a camper doesn't have a conflict with every activity. Note: An activity may have more than 9 campers due to conflicts.
    for (const camperIdStr of unassignedCampers) {

      const camper = camperIdStrToCamper[camperIdStr];

      for (const activityIndex of actIndicesByCamperCount) {

        const activity = activities[activityIndex];

        if (doesConflictExist(camper, activity.assignments.camperIds)) continue;
          
        activity.assignments.camperIds.push(camper.id);
        activities[activityIndex].assignments.camperIds.length++;
        actIndicesByCamperCount.sort((a, b) => activities[a].assignments.camperIds.length - activities[b].assignments.camperIds.length);
        // Move to the next unassigned camper
        break; 
      }
    }
  }

  // Assigns staff randomly to each activity in the given block, aiming for a 1:1 ratio
  assignStaff<T extends 'BUNDLE'>(blockID: string, staffAttendees: StaffAttendeeID[]): void {

    if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");
    
    const activities = this.schedule.blocks[blockID].activities;

    // Assign program area counselors to their activities first and builds array of available staff
    const availableStaff: StaffAttendeeID[] = [];

    for (const staff of staffAttendees) {

      if (this.schedule.blocks[blockID].periodsOff.includes(staff.id)) continue; // skip staff with period off
      if (staff.programCounselor) {
        // Find the activity that matches the staff's program area
        const activity = activities.find(act => act.name === staff.programCounselor?.name);
        if (activity) {
          activity.assignments.staffIds.push(staff.id);
        } 
      } else {
        availableStaff.push(staff);
      }
    }

    const targetStaffCount: number[] = activities.map(act => act.assignments.camperIds.length);

    // Shuffle staff
    for (let i = availableStaff.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableStaff[i], availableStaff[j]] = [availableStaff[j], availableStaff[i]];
    }

    const unassignedStaff: StaffAttendeeID[] = [];

    // Place staff in activities
    for (const staff of availableStaff) {

      let assigned = false;
      for (let i = 0; i < activities.length; i++) {

        const activity = activities[i];
        if (activity.assignments.staffIds.length >= targetStaffCount[i]) continue;
        if (doesConflictExist(staff, activity.assignments.staffIds)) continue;

        activity.assignments.staffIds.push(staff.id);
        assigned = true;
        break;
      }

      if (!assigned) {
        unassignedStaff.push(staff); 
      }
    }

    // Arbitrarily assign remaining unassigned staff to activities
    // Assumes a staff member doesn't have a conflict with every activity
    let activityIndex = 0;
    while (unassignedStaff.length > 0) {
      const staff = unassignedStaff.pop();
      if (doesConflictExist(staff!, activities[activityIndex].assignments.staffIds)) continue; 
      activities[activityIndex].assignments.staffIds.push(staff!.id);
      activityIndex = (activityIndex + 1) % activities.length;
    }
  }

  // Assigns admin staff randomly to each activity in the given block
  assignAdmin<T extends 'BUNDLE'>(blockID: string, adminAttendees: AdminAttendeeID[]): void {

    if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

    const activities = this.schedule.blocks[blockID].activities;

    // Build array of available admins
    const availableAdmins: AdminAttendeeID[] = [];
    for (const admin of adminAttendees) {
      if (this.schedule.blocks[blockID].periodsOff.includes(admin.id)) continue;
      availableAdmins.push(admin);
    }

    // Shuffle admins
    for (let i = availableAdmins.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableAdmins[i], availableAdmins[j]] = [availableAdmins[j], availableAdmins[i]];
    }

    // Assigns admins to activities
    // Assumes an admin doesn't have a conflict with every activity
    let activityIndex = 0;
    while (availableAdmins.length > 0) {
      const admin = availableAdmins.pop();
      if (doesConflictExist(admin!, activities[activityIndex].assignments.adminIds)) continue;
      activities[activityIndex].assignments.adminIds.push(admin!.id);
      activityIndex = (activityIndex + 1) % activities.length;
    }
  }
}