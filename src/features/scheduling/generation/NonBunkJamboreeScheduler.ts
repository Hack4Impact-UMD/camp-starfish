/* Campers have been assigned individually instead of by bunk*/
import {
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  SectionSchedule,
  SectionPreferences,
  NonBunkJamboreeActivityWithAssignments,
  SchedulingSectionID
} from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";
import moment from "moment";


export class NonBunkJamboreeScheduler {
  schedule: SectionSchedule<"NON-BUNK-JAMBO"> = {
    blocks: {},
    alternatePeriodsOff: {},
  };

  /* givens */
  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];
  camperPrefs: SectionPreferences = {};
  blocksToAssign: string[] = [];
  sectionID: SchedulingSectionID = {
    id: "",
    name: `Non-Bunk Jamboree`,
    type: "BUNDLE",
    startDate: "",          // ISO-8601 string (e.g. "2026-01-05")
    endDate: "",            // ISO-8601 string
    numBlocks: 0,
    isPublished: false,
    sessionId: ""
  };

  currDate: string = "";

  constructor() {}

  withSchedule(
    schedule: SectionSchedule<"NON-BUNK-JAMBO">
  ): NonBunkJamboreeScheduler {
    this.schedule = schedule;
    return this;
  }
  withSectionID(sectionID: SchedulingSectionID): NonBunkJamboreeScheduler { this.sectionID = sectionID; return this; }

  withCampers(campers: CamperAttendeeID[]): NonBunkJamboreeScheduler {
    this.campers = campers;
    return this;
  }

  withStaff(staff: StaffAttendeeID[]): NonBunkJamboreeScheduler {
    this.staff = staff;
    return this;
  }

  withAdmins(admins: AdminAttendeeID[]): NonBunkJamboreeScheduler {
    this.admins = admins;
    return this;
  }

  withCamperPrefs(camperPrefs: SectionPreferences): NonBunkJamboreeScheduler {
    this.camperPrefs = camperPrefs;
    return this;
  }

  forBlocks(blockIds: string[]): NonBunkJamboreeScheduler {
    this.blocksToAssign = blockIds;
    return this;
  }

  getSchedule(): SectionSchedule<"NON-BUNK-JAMBO"> {
    return this.schedule;
  }

  setCurrDate() {
    this.currDate = moment(this.sectionID.startDate)
      .format("YYYY-MM-DD");
  }


  assignPeriodsOff() {

    // Filter out all staff/admin that have the day OFF 
    const eligibleStaff = this.staff.filter(s => !s.daysOff.includes(this.currDate));
    const eligibleAdmins = this.admins.filter(a => !a.daysOff.includes(this.currDate));
    const allStaffAndAdmins = [...eligibleStaff, ...eligibleAdmins];

    const notAssigned = new Set<StaffAttendeeID | AdminAttendeeID>(allStaffAndAdmins);

    const TOTAL_POSSIBLE_REST_BLOCKS =
      this.blocksToAssign.length + Object.keys(this.schedule.alternatePeriodsOff).length;

    const MAX_CAPACITY = allStaffAndAdmins.length / TOTAL_POSSIBLE_REST_BLOCKS;

    // Fill blocks first before moving onto alternate periods off
    for (const blockId of this.blocksToAssign) {
      if (!this.schedule.blocks[blockId]) throw new Error("Invalid block");

      const block = this.schedule.blocks[blockId];
      const activities = block.activities;

      const isBusy = (id: number) =>
        activities.some(
          act =>
            act.assignments.staffIds.includes(id) ||
            act.assignments.adminIds.includes(id)
        );

      // Alternate preference per successful assignment
      let pickAdminNext = true;

      const tryAssignPerson = (person: StaffAttendeeID | AdminAttendeeID) => {
        if (!notAssigned.has(person)) return false;
        if (isBusy(person.id)) return false;

        // Assigns the staff/admin member to the block for period off
        block.periodsOff.push(person.id);
        notAssigned.delete(person);

        // If there is still space in the block for periods off, then assign a yesyes
        if (block.periodsOff.length < MAX_CAPACITY) {
          // Filters out yesyesList that are already assigned to an activity or have a day off
          let filteredYesyesList = person.yesyesList
            .filter((id: number) => allStaffAndAdmins.some(p => p.id === id));
          filteredYesyesList = filteredYesyesList
            .filter((id: number) => !isBusy(id));

          // Assigns the yesyes to the block
          for (const yesyes of filteredYesyesList) {
            if (block.periodsOff.length >= MAX_CAPACITY) break;

            const yesyesPerson = allStaffAndAdmins.find(p => p.id === yesyes);
            if (!yesyesPerson) continue;

            if (!notAssigned.has(yesyesPerson)) continue;

            block.periodsOff.push(yesyes);
            notAssigned.delete(yesyesPerson);
            break; // only assign one yesyes
          }
        }

        return true;
      };

      // Fill block up to capacity, alternating staff/admin
      while (block.periodsOff.length < MAX_CAPACITY && notAssigned.size > 0) {
        const primary = pickAdminNext ? eligibleAdmins : eligibleStaff;
        const secondary = pickAdminNext ? eligibleStaff : eligibleAdmins;

        let assigned = false;

        // Try primary group first
        for (const person of primary) {
          if (tryAssignPerson(person)) {
            assigned = true;
            pickAdminNext = !pickAdminNext; // flip ONLY after success
            break;
          }
        }

        // If none found, try the other group
        if (!assigned) {
          for (const person of secondary) {
            if (tryAssignPerson(person)) {
              assigned = true;
              pickAdminNext = !pickAdminNext;
              break;
            }
          }
        }

        // Prevent infinite loop if nobody eligible can be assigned
        if (!assigned) break;
      }
    }

    // Assign alternate periods off
    const remainingRestBlocks = TOTAL_POSSIBLE_REST_BLOCKS - this.blocksToAssign.length;

    if (remainingRestBlocks <= 0) return;

    const MAX_CAPACITY_APOS = notAssigned.size / remainingRestBlocks;

    // The remaining people in notAssigned are distributed among the APOS
    while (notAssigned.size > 0) {
      for (const apo of Object.keys(this.schedule.alternatePeriodsOff)) {
        while (
          this.schedule.alternatePeriodsOff[apo].length < MAX_CAPACITY_APOS &&
          notAssigned.size > 0
        ) {
          const iter = notAssigned.values().next();
          if (iter.done) break;

          const next = iter.value;
          this.schedule.alternatePeriodsOff[apo].push(next.id);
          notAssigned.delete(next);
        }
      }
    }
  }


  /*
   assigns campers to activities while maintaining 1:1 staff-to-camper ratio
   ensures we never have more campers than available staff in any block
   */
  assignCampers() {
    const MAX_CAPACITY = 9;
    const MIN_CAPACITY = 4;

    // Sort all campers by date of birth
    const sortedCampers = this.campers.sort((a, b) =>
      moment(a.dateOfBirth).diff(moment(b.dateOfBirth))
    );

    // ---- shared helpers ----

    // Tries to assign camper to activity. Returns true if successful. False if full or conflict
    const tryAssign = (
      camper: CamperAttendeeID,
      activity: NonBunkJamboreeActivityWithAssignments,
      cap = MAX_CAPACITY
    ) => {
      if (activity.assignments.camperIds.length >= cap) return false;
      if (doesConflictExist(camper, activity.assignments.camperIds)) return false;
      activity.assignments.camperIds.push(camper.id);
      return true;
    };

    // Assigns a group of campers to a block's activities
    const assignGroup = (
      blockID: string,
      campers: CamperAttendeeID[],
      activities: NonBunkJamboreeActivityWithAssignments[],
    ) => {
      const assigned = new Set<number>();

      // First pass: assign campers based on preferences
      for (const camper of campers) {

        const prefs = this.camperPrefs[blockID]?.[camper.id];
        if (!prefs) continue;

        // Sort preferences: lowest number = highest preference
        const sortedPrefs = Object.entries(prefs).sort(([, a], [, b]) => a - b);

        for (const [name] of sortedPrefs) {
          const activity = activities.find(a => a.name === name);
          if (activity && tryAssign(camper, activity)) {
            assigned.add(camper.id);
            break;
          }
        }
      }

      // Second pass: assign unassigned campers to any available activity
      for (const camper of campers) {
        if (assigned.has(camper.id)) continue;

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

      // Rebalance underfilled activities
      const underfilled = activities.filter(a => a.assignments.camperIds.length < MIN_CAPACITY);

      for (const target of underfilled) {
        while (target.assignments.camperIds.length < MIN_CAPACITY) {
          const donors = activities
            .filter(a => a !== target && a.assignments.camperIds.length > MIN_CAPACITY)
            .sort((a, b) => b.assignments.camperIds.length - a.assignments.camperIds.length);

          let moved = false;

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

      // Warn if any campers remain unassigned
      const notAssigned = campers.filter(c => !assigned.has(c.id));
      if (notAssigned.length) {
        console.warn(`[${blockID}]: ${notAssigned.length} campers unassigned`);
      }

      return { assigned, notAssigned };
    };

    // Assign campers to each block
    for (const blockId of this.blocksToAssign) {
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      assignGroup(blockId, sortedCampers, block.activities);
    }
  }


  //assign counselors to activities
  assignCounselors() {
    for (const blockID of this.blocksToAssign) {
      if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

      const activities = this.schedule.blocks[blockID].activities;
      if (!activities || activities.length === 0) throw new Error("Block has no activities");

      const availableStaff = this.staff.filter(
        s =>
          !this.schedule.blocks[blockID].periodsOff.includes(s.id) &&
          !s.daysOff.includes(this.currDate) 
      );

      // shuffle
      for (let i = availableStaff.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableStaff[i], availableStaff[j]] = [availableStaff[j], availableStaff[i]];
      }

      const targetStaffCount = activities.map(a => a.assignments.camperIds.length);
      const unassignedStaff: StaffAttendeeID[] = [];

      for (const staff of availableStaff) {
        const activity = activities.find((a, i) =>
          a.assignments.staffIds.length < targetStaffCount[i] &&
          !doesConflictExist(staff, [...a.assignments.camperIds, ...a.assignments.staffIds, ...a.assignments.adminIds])
        );

        if (activity) activity.assignments.staffIds.push(staff.id);
        else unassignedStaff.push(staff);
      }

      while (unassignedStaff.length) {
        const staff = unassignedStaff.pop()!;

        let min_activity = activities.find(activity =>
          !doesConflictExist(staff, [...activity.assignments.camperIds, ...activity.assignments.staffIds, ...activity.assignments.adminIds])
        );

        if (!min_activity) {
          console.warn(`Staff ${staff.id} conflicts with everyone in block ${blockID}. Skipping.`);
          continue;
        }

        for (const activity of activities) {
          if (doesConflictExist(staff, [...activity.assignments.camperIds, ...activity.assignments.staffIds, ...activity.assignments.adminIds])) continue;

          if (activity.assignments.staffIds.length < min_activity.assignments.staffIds.length) {
            min_activity = activity;
          }
        }

        min_activity.assignments.staffIds.push(staff.id);
      }

      const diff = (a: NonBunkJamboreeActivityWithAssignments) => a.assignments.camperIds.length - a.assignments.staffIds.length;

      // helper: can this staffId be moved?
      const isDonatableStaffId = (id: number) => {
        const staffObj = this.staff.find(s => s.id === id);
        return !!staffObj;
      };

      const rebalanceOnce = (maxAllowedDonorDiffAfterDonate: number) => {
        const needsStaff = activities.filter(a => diff(a) > maxAllowedDonorDiffAfterDonate);

        const canDonate = activities
          .filter(a =>
            // must have at least 2 staff AND at least 1 of them is donatable
            a.assignments.staffIds.length > 1 &&
            a.assignments.staffIds.some(isDonatableStaffId) &&
            diff(a) <= maxAllowedDonorDiffAfterDonate
          )
          .sort((a, b) => diff(a) - diff(b));

        for (const receiver of needsStaff) {

          while (diff(receiver) > maxAllowedDonorDiffAfterDonate) {
            const donor = canDonate.find(d =>
              d.assignments.staffIds.length > 1 &&
              d.assignments.staffIds.some(isDonatableStaffId) &&
              diff(d) <= maxAllowedDonorDiffAfterDonate
            );

            if (!donor) break;

            // choose a donatable staff member
            const donateIdx = donor.assignments.staffIds.findIndex(isDonatableStaffId);
            if (donateIdx === -1) continue;

            const staffId = donor.assignments.staffIds.splice(donateIdx, 1)[0];
            if (staffId == null) continue;

            const staffObj = this.staff.find(s => s.id === staffId);

            // conflict check with receiver
            if (
              staffObj &&
              doesConflictExist(staffObj, [
                ...receiver.assignments.camperIds,
                ...receiver.assignments.staffIds,
                ...receiver.assignments.adminIds,
              ])
            ) {
              donor.assignments.staffIds.push(staffId); // put back
              continue;
            }

            receiver.assignments.staffIds.push(staffId);
            
          }
          
        }
      };

      // First pass: try to balance 1:1 ratio. Aim for diff <= 1
      rebalanceOnce(1);

      // Check again
      const ratioStillNotMet = activities.some(a => diff(a) > 1);

      // Second pass: try to balance 1:1 ratio. Aim for diff <= 2
      if (ratioStillNotMet) {
        rebalanceOnce(2);
      }

      const ratioStillNotMet2 = activities.some(a => diff(a) > 2);



      // Warn users for manual changes if ratio still not met.
      if (ratioStillNotMet2) {
        console.warn(blockID, "Could not balance 1:1 ratio. Manual changes may be required.");
      }

    }
  }


  //assigning admins to activity blocks
  assignAdmin(){


    for (const blockID of this.blocksToAssign) {

      if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

      const activities = this.schedule.blocks[blockID].activities;
      if (!activities || activities.length === 0) throw new Error("Block has no activities");
      
      // Build array of available admins
      const availableAdmins = this.admins.filter(
        admin => !this.schedule.blocks[blockID].periodsOff.includes(admin.id) && 
        !admin.daysOff.includes(this.currDate) &&
        !activities.some(activity => activity.assignments.adminIds.includes(admin.id))
      );      


      // Shuffle admins
      for (let i = availableAdmins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableAdmins[i], availableAdmins[j]] = [availableAdmins[j], availableAdmins[i]];
      }

      // Assign admins to activities, avoiding conflicts and balancing distribution

      const unassignedAdmin: AdminAttendeeID[] = [];

      const MAX_CAPACITY_ADMINS = Math.floor(availableAdmins.length/activities.length);
      for (const admin of availableAdmins) {
        const activity = activities.find((a) =>
          a.assignments.adminIds.length < MAX_CAPACITY_ADMINS &&
          !doesConflictExist(admin, [...a.assignments.camperIds, ...a.assignments.staffIds, ...a.assignments.adminIds])
        );

        if (activity) activity.assignments.adminIds.push(admin.id);
        else unassignedAdmin.push(admin);
      }

      const stillUnassigned = new Set<number>(unassignedAdmin.map(a => a.id));

      // One pass to assign the rest of admins to activities that have the largest camper, staff difference
      for (const admin of unassignedAdmin) {
        const activity = activities
          .sort((a, b) => b.assignments.camperIds.length - a.assignments.camperIds.length)
          .find((a) => !doesConflictExist(admin, [...a.assignments.camperIds, ...a.assignments.staffIds, ...a.assignments.adminIds]));
        if (activity) 
        {
          activity.assignments.adminIds.push(admin.id);
          stillUnassigned.delete(admin.id);
        } 


      }

      if (stillUnassigned.size > 0) console.warn(blockID, "Unassigned admins: ", stillUnassigned);


      // Check if there's at least one admin assigned to each activity
      const missingAdmins = this.schedule.blocks[blockID].activities.some((activity) => activity.assignments.adminIds.length === 0);
      if (missingAdmins) console.warn(blockID, "No admin assigned to activity");  
      
    }



  }

}