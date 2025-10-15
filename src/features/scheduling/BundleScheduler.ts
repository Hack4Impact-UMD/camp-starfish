import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SectionPreferences, BundleActivity } from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";
import moment from "moment";

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

	// Assigns campers to their Bundle activities for all blocks in the bundle
  assignCampers() {

    for (const blockID of this.blocksToAssign) {

      if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

      const activities = this.schedule.blocks[blockID].activities;
      if (!activities || activities.length === 0) throw new Error("Block has no activities");

      // Calculate the average number of campers per activity
      const lenNAV = this.campers.filter(c => c.ageGroup === 'NAV').length;
      const lenOCP = this.campers.length - lenNAV;
      const avgCampersNAV = Math.ceil(lenNAV / activities.length);
      const avgCampersOCP = Math.ceil(lenOCP / activities.length);

      // Sort campers by age, oldest first
      const sortedCampers = [...this.campers].sort((a, b) =>
        moment(a.dateOfBirth).diff(moment(b.dateOfBirth))
      );

      // Assign campers to activities based on preferences and availability
      for (const camper of sortedCampers) {

        const camperPrefsForBlock = this.camperPrefs[blockID]?.[camper.id];
        if (!camperPrefsForBlock) continue;

        const avgCampersPerActivity = camper.ageGroup === 'NAV' ? avgCampersNAV : avgCampersOCP;

        // Sort activities by preference score (lower score = higher preference)
        const activityIDsByPref = Object.entries(camperPrefsForBlock)
          .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
          .map(([activityId]) => activityId);

        // Assign the camper to their highest-preference available activity
        for (const activityId of activityIDsByPref) {
          
          // TODO cannot find activity name to ID mapping
          const activity = activities.find(act => act.name === activityId && act.ageGroup === camper.ageGroup);
          if (!activity || activity.assignments.camperIds.length >= avgCampersPerActivity || doesConflictExist(camper, [...activity.assignments.camperIds, ...activity.assignments.staffIds, ...activity.assignments.adminIds])) {
            continue;
          }
          activity.assignments.camperIds.push(camper.id);
          break; // Assigned successfully, move to next camper
        }
      }
    }
  }

  // Assigns staff randomly to each activity in the given block, aiming for a 1:1 ratio
  assignStaff(){

    for (const blockID of this.blocksToAssign) {

      if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");
      
      const activities = this.schedule.blocks[blockID].activities;
      if (!activities || activities.length === 0) throw new Error("Block has no activities");

      // Assign program area counselors first; collect remaining available staff
      const availableStaff = this.staff.filter(staff => {
        const isOff = this.schedule.blocks[blockID].periodsOff.includes(staff.id);
        if (isOff) return false;

        const areaName = staff.programCounselor?.name; // TODO cannot find program area name to ID mapping
        const activity = areaName && activities.find(act => act.name === areaName);

        if (activity) {
          activity.assignments.staffIds.push(staff.id);
          return false;
        }

        return true;
      });

      // Shuffle staff
      for (let i = availableStaff.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableStaff[i], availableStaff[j]] = [availableStaff[j], availableStaff[i]];
      }

      // Aim for 1:1 ratio of staff to campers
      const targetStaffCount: number[] = activities.map(act => act.assignments.camperIds.length);

      const unassignedStaff: StaffAttendeeID[] = [];

      // Place staff in activities
      for (const staff of availableStaff) {
        const activity = activities.find((a, i) =>
          a.assignments.staffIds.length < targetStaffCount[i] &&
          !doesConflictExist(staff, [...a.assignments.camperIds, ...a.assignments.staffIds, ...a.assignments.adminIds])
        );

        if (activity) activity.assignments.staffIds.push(staff.id);
        else unassignedStaff.push(staff);
      }

      // Distribute remaining staff to any non-conflicting activities
      let activityIndex = 0;

      while (unassignedStaff.length) {
        const staff = unassignedStaff.pop()!;
        const startIdx = activityIndex;

        const activity = activities.find((_, i) => {
          const idx = (i + startIdx) % activities.length;
          if (!doesConflictExist(
            staff,
            [...activities[idx].assignments.camperIds,
            ...activities[idx].assignments.staffIds,
            ...activities[idx].assignments.adminIds]
          )) {
            activityIndex = (idx + 1) % activities.length;
            return true;
          }
          return false;
        });

        if (activity) activity.assignments.staffIds.push(staff.id);
        else console.warn(`Could not assign staff ${staff.id} due to conflicts.`);
      }
    }
  }

  // Assigns admin staff randomly to each activity in the given block
  assignAdmin(){

    for (const blockID of this.blocksToAssign) {

      if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

      const activities = this.schedule.blocks[blockID].activities;
      if (!activities || activities.length === 0) throw new Error("Block has no activities");
      
      // Build array of available admins
      const availableAdmins = this.admins.filter(
        admin => !this.schedule.blocks[blockID].periodsOff.includes(admin.id)
      );

      // Shuffle admins
      for (let i = availableAdmins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableAdmins[i], availableAdmins[j]] = [availableAdmins[j], availableAdmins[i]];
      }

      // Assign admins to activities, avoiding conflicts and balancing distribution
      let activityIndex = 0;

      while (availableAdmins.length) {
        const admin = availableAdmins.pop()!;
        const startIdx = activityIndex;

        // Find the first activity where the admin has no conflicts
        const activity = activities.find((_, i) => {
          const idx = (startIdx + i) % activities.length;
          const conflictsWith = [
            ...activities[idx].assignments.camperIds,
            ...activities[idx].assignments.staffIds,
            ...activities[idx].assignments.adminIds,
          ];

          if (!doesConflictExist(admin, conflictsWith)) {
            activityIndex = (idx + 1) % activities.length;
            return true;
          }
          return false;
        });

        if (activity) activity.assignments.adminIds.push(admin.id);
        else console.warn(`Could not assign admin ${admin.id} to any activity.`);
      }
    }
  }
}