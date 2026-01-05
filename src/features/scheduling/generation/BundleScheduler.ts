import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SectionPreferences, ProgramAreaID, BundleActivity, ActivityAssignments, BundleActivityWithAssignments } from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";
import moment from "moment";
import { MAX } from "uuid";
import { a } from "framer-motion/dist/types.d-BJcRxCew";
import { min } from "moment";
import { ac } from "@faker-js/faker/dist/airline-CLphikKp";

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
    Each `programArea` needs a staff member (`StaffAttendeeID`) to be in charge.
    This function assigns the given programArea to the corresponding staff member.
  */
  assignProgramAreaCounselor(programArea: ProgramAreaID, staffID: StaffAttendeeID): void {
    staffID.programCounselor = programArea;
  }

  /* Each staff member and admin needs to have 1 period off per day */
  assignPeriodsOff() { return this; }

  /*
    Assign a camper (CamperAttendeeID) to the "Teen Chat" activity in the given block.
    Also update the block's`IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignOCPChats(): void {

    // OCP Campers
    let ocp_campers = this.campers.filter(c => c.ageGroup === 'OCP');

    // Calculates the max capacity for each teen chat activity
    const MAX_CAPACITY_OCP = Math.ceil(ocp_campers.length / 3) // Divides by three because there are 3 teen chat blocks
    let added = false

    // Goes through each ocp camper and assigns them to a teen chat activity
    ocp_campers.forEach(camper => {
      added = false
      const ocpChatBlocks = this.blocksToAssign.filter(bId =>
        this.schedule.blocks[bId]?.activities.some(act => act.programArea.id === 'TC')
      );

      if (ocpChatBlocks.length === 0) return;

      ocpChatBlocks.forEach(blockId => {
        const block = this.schedule.blocks[blockId];
        const activity = block?.activities.find(act => act.programArea.id === "TC" );
        if (activity && activity.assignments.camperIds.length < MAX_CAPACITY_OCP && !added) {
          activity.assignments.camperIds.push(camper.id);
          added = true;
        }
      });
    })

  }

  /*
    Assign campers (CamperAttendeeID[]) to the "Waterfront" activity in the given block. 
    Also update the block's `IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignSwimmingBlock(): void {
    const WATERFRONT_AREA_ID = 'WF';

    // NAV Campers
    const nav_campers = this.campers.filter(c => c.ageGroup === 'NAV');

    // OCP Campers for first bundle (includes all)
    const ocp_campers = this.campers.filter(c => c.ageGroup === 'OCP');

    // OCP Campers for any other bundle besides first (excludes swim opt outs)
    const ocp_campers_filtered = ocp_campers.filter(c => c.swimOptOut === false);

    // Calculates the max capacity for each waterfront activity based on the number of campers
    const MAX_CAPACITY_NAV = Math.ceil(nav_campers.length / 3); // Divides by three beacuse there are 3 waterfront activities for nav campers 
    let MAX_CAPACITY_OCP = Math.ceil(ocp_campers.length / 2); // Divides by two because there are 2 waterfront activities for ocp campers

    let added = false;

    // Goes through each nav camper and assigns them to a waterfront activity
    nav_campers.forEach(camper => {
      added = false;
      const swimBlocks = this.blocksToAssign.filter(bId =>
        this.schedule.blocks[bId]?.activities.some(
          act => act.ageGroup === camper.ageGroup && act.programArea.id === WATERFRONT_AREA_ID
        )
      );

      swimBlocks.forEach(blockId => {
        const block = this.schedule.blocks[blockId];
        const activity = block?.activities.find(act => act.programArea.id === WATERFRONT_AREA_ID );
        if (activity && activity.assignments.camperIds.length < MAX_CAPACITY_NAV && !added) {
          activity.assignments.camperIds.push(camper.id);
          added = true;
        }
      });
    });
    
    // Goes through each ocp camper and assigns them to a waterfront activity
    ocp_campers.forEach(camper => {
      added = false;
      const swimBlocks = this.blocksToAssign.filter(bId =>
        this.schedule.blocks[bId]?.activities.some(
          act => act.ageGroup === camper.ageGroup && act.programArea.id === WATERFRONT_AREA_ID
        )
      );

      let requiredBlocks: string[] = [];

      // Checks if bundle number is one and if it is, then camper could be assigned to any block
      if (this.bundleNum === 1) {
        requiredBlocks = swimBlocks;

        // Uses original ocp campers list to calculate max capacity for even distribution
        MAX_CAPACITY_OCP = Math.ceil(ocp_campers.length / 2);
      } 

      // If bundleNum, not one, then level and swim opt out must be checked
      else {
        if (camper.level <= 3 || !camper.swimOptOut) {
          requiredBlocks = swimBlocks;

          // Uses new filtered ocp campers list to calculate max capacity for even distribution
          MAX_CAPACITY_OCP = Math.ceil(ocp_campers_filtered.length / 2);
        }
      }

      // Assigns camper to one waterfront activity if they need it
      requiredBlocks.forEach(blockId => {
        const block = this.schedule.blocks[blockId];
        const activity = block?.activities.find(act => act.programArea.id === WATERFRONT_AREA_ID);
        if (activity && activity.assignments.camperIds.length < MAX_CAPACITY_OCP && !added) {
          activity.assignments.camperIds.push(camper.id);
          added = true;
          
        }
      });

    });

  }

	// Assigns campers to their Bundle activities for all blocks in the bundle
  assignCampers() {
    this.assignSwimmingBlock();
    this.assignOCPChats();

    const MAX_CAPACITY = 9;
    const MIN_CAPCITY = 4;

    const navCampers = this.campers
      .filter(c => c.ageGroup === "NAV")
      .sort((a, b) => moment(a.dateOfBirth).diff(moment(b.dateOfBirth)));

    const ocpCampers = this.campers
      .filter(c => c.ageGroup === "OCP")
      .sort((a, b) => moment(a.dateOfBirth).diff(moment(b.dateOfBirth)));

    // ---- shared helpers ----

    // Tries to assign camper to activity. Returns true if successful. Returns false if conflict exists or activity is full
    const tryAssign = (
      camper: CamperAttendeeID,
      activity: BundleActivityWithAssignments,
      cap = MAX_CAPACITY
    ) => {
      if (activity.assignments.camperIds.length >= cap) return false;
      if (doesConflictExist(camper, activity.assignments.camperIds)) return false;
      activity.assignments.camperIds.push(camper.id);
      return true;
    };

    // Assigns a group of campers to activities
    const assignGroup = (
      blockID: string,
      campers: CamperAttendeeID[],
      activities: BundleActivityWithAssignments[],
      specials: BundleActivityWithAssignments[],
      label: "OCP" | "NAV"
    ) => {
      const assigned = new Set<number>();

      for (const camper of campers) {
        if (specials.some(a => a.assignments.camperIds.includes(camper.id))) {
          assigned.add(camper.id);
          continue;
        }

        const prefs = this.camperPrefs[blockID]?.[camper.id];
        if (!prefs) continue;

        const sortedPrefs = Object.entries(prefs).sort(([, a], [, b]) => a - b);

        // First attempt at assigning through preferences
        for (const [name] of sortedPrefs) {
          const activity = activities.find(a => a.name === name);
          if (activity && tryAssign(camper, activity)) {
            assigned.add(camper.id);
            break;
          }
        }

        if (assigned.has(camper.id)) continue;

        // If preferences didn't work, try to assign to any activity that has min capacity
        const candidates = activities
          .filter(a => !doesConflictExist(camper, a.assignments.camperIds))
          .sort((a, b) => a.assignments.camperIds.length - b.assignments.camperIds.length);

        for (const activity of candidates) {
          if (tryAssign(camper, activity)) {
            assigned.add(camper.id);
            break;
          }
        }
      }

      // Assigns to any underfilled activities
      const underfilled = activities.filter(
        a => a.assignments.camperIds.length < MIN_CAPCITY
      );


      // For each undefilled activity, while activity is still underfilled, take from max capacity activities

      for (const target of underfilled) {

        while (target.assignments.camperIds.length < MIN_CAPCITY) {
          const donors = activities
            .filter(a => a !== target && a.assignments.camperIds.length > MIN_CAPCITY)
            .sort((a, b) => b.assignments.camperIds.length - a.assignments.camperIds.length);

          let moved = false;

          // Goes through each donor and tries to find a camper to move
          for (const donor of donors) {
            for (let i = donor.assignments.camperIds.length - 1; i >= 0; i--) {
              const camperId = donor.assignments.camperIds[i];
              if (target.assignments.camperIds.includes(camperId)) continue;

              const camper = campers.find(c => c.id === camperId);
              if (!camper) continue;
              if (doesConflictExist(camper, target.assignments.camperIds)) continue;

              donor.assignments.camperIds.splice(i, 1);
              target.assignments.camperIds.push(camperId);
              moved = true;
              break;
            }
            if (moved) break;
          }

          if (!moved) break;
        }
      }

      // warn if any unassigned. Will allow the user to assign them manually
      const notAssigned = campers.filter(c => !assigned.has(c.id));
      if (notAssigned.length) {
        console.warn(`[${blockID}] ${label}: ${notAssigned.length} campers unassigned`);
      }

      return { assigned, notAssigned };
    };

    // ---- Main ----
    // For each block assign activities
    for (const blockID of this.blocksToAssign) {
      const block = this.schedule.blocks[blockID];
      if (!block) throw new Error("Invalid block");

      const acts = block.activities;

      const navActs = acts.filter(a => a.ageGroup === "NAV" && a.programArea.id !== "WF");
      const ocpActs = acts.filter(
        a => a.ageGroup === "OCP" && a.programArea.id !== "WF" && a.programArea.id !== "TC"
      );

      if (!navActs.length || !ocpActs.length) {
        throw new Error("Block has no activities");
      }

      assignGroup(
        blockID,
        ocpCampers,
        ocpActs,
        acts.filter(a => a.ageGroup === "OCP" && ["WF", "TC"].includes(a.programArea.id)),
        "OCP"
      );

      assignGroup(
        blockID,
        navCampers,
        navActs,
        acts.filter(a => a.ageGroup === "NAV" && a.programArea.id === "WF"),
        "NAV"
      );
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