/* Campers have been assigned individually instead of by bunk*/
import {
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  SectionSchedule,
  SectionPreferences,
  JamboreeActivity,
  IndividualAssignments,
  NonBunkJamboreeActivityWithAssignments,
  SchedulingSectionID
} from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";
import moment from "moment";

// activity size constraints
const MIN_CAMPERS_PER_ACTIVITY = 4; // minimum
const MAX_CAMPERS_PER_ACTIVITY = 9; // maximum
const IDEAL_MIN_CAMPERS = 5; // preferred minimum
const IDEAL_MAX_CAMPERS = 8; // preferred maximum

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
  //relationships more generic to include staff/admin, staff/staff, admin/admin, camper/camper, camper/staff, camper/admin
  private relationships: Array<{ attendeeOneId: number; attendeeTwoId: number;}> = [];

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

  private guardBlocks(): boolean {
    //checking length of blocks as a guard clause, called in every assignment function
    if (this.blocksToAssign.length === 0) {
      this.blocksToAssign = Object.keys(this.schedule.blocks);
    }
    return this.blocksToAssign.length > 0;
  }

  assignPeriodsOff() {

    // Filter out all staff/admin that have the day OFF 
    const eligibleStaff = this.staff.filter(s => !s.daysOff.includes(this.sectionID.id));
    const eligibleAdmins = this.admins.filter(a => !a.daysOff.includes(this.sectionID.id));
    const allStaffAndAdmins = [...eligibleStaff, ...eligibleAdmins];

    const notAssigned = new Set<StaffAttendeeID | AdminAttendeeID>(allStaffAndAdmins);

    const TOTAL_POSSIBLE_REST_BLOCKS =
      this.blocksToAssign.length + Object.keys(this.schedule.alternatePeriodsOff).length;

    const MAX_CAPACITY = allStaffAndAdmins.length / TOTAL_POSSIBLE_REST_BLOCKS;

    // Fill blocks firs tbefore moving onto alternate periods off
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
  assignCounselors(): NonBunkJamboreeScheduler {
    if (!this.guardBlocks()) {
      return this; // nothing to assign
    }

    this.relationships = this.relationships.length
      ? this.relationships
      : this.staffAdminRelationship();
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      if (!currentBlock) {
        continue;
      }
      // track which staff have already been placed in this block to avoid double-assignments
      const assignedThisBlock = new Set<number>();
      for (const activity of currentBlock.activities) {
        for (const sid of activity.assignments.staffIds) {
          assignedThisBlock.add(sid);
        }
      }

      // ensure near 1:1 by filling remaining needs per activity, only on activities with campers
      const relationshipsByStaff = new Map<number, number>();
      for (const r of this.relationships) {
        relationshipsByStaff.set(r.attendeeOneId, r.attendeeTwoId);
      }
      const availableStaff = this.staff.filter(
        (s) => !this.isStaffOnPeriodOff(s.id, blockId)
      );
      for (const activity of currentBlock.activities) {
        const campers = activity.assignments.camperIds.length;
        if (campers === 0) {
          continue;
        }
        let have = activity.assignments.staffIds.length;
        let need = Math.max(0, campers - have);
        while (need > 0) {
          let placed = false;
          for (const staff of availableStaff) {
            if (assignedThisBlock.has(staff.id)) {
              continue;
            }
            // avoid staff-staff nono conflicts within the activity
            if (
              this.checkStaffNonoConflicts(staff, activity.assignments.staffIds)
            ) {
              continue;
            }
            // avoid staff-camper nono conflicts within the activity
            if (doesConflictExist(staff, activity.assignments.camperIds)) {
              continue;
            }
            // avoid placing with relationship admin
            const relAdmin = relationshipsByStaff.get(staff.id);
            if (relAdmin && activity.assignments.adminIds.includes(relAdmin)) {
              continue;
            }
            activity.assignments.staffIds.push(staff.id);
            assignedThisBlock.add(staff.id);
            have++;
            need--;
            placed = true;
            break;
          }
          if (!placed) {
            break;
          }
        }
      }
    }
    return this;
  }

  getSchedule(): SectionSchedule<"NON-BUNK-JAMBO"> {
    return this.schedule;
  }

  //HELPER FUNCTIONS

  //checking if a relationship exists between staff/admin to help with scheduling blocks and returns an array contianing the relationships
  private staffAdminRelationship(): Array<{ attendeeOneId: number; attendeeTwoId: number;}> {
    //relationships are more generic so we can check relationships between staff/admin, staff/staff, admin/admin if needed
    const currentRelationships: Array<{attendeeOneId: number; attendeeTwoId: number;}> = [];
    //confirming relationships of staff/admin
    for (const staff of this.staff) {
      for (const admin of this.admins) {
        if (
          staff.yesyesList?.includes(admin.id) &&
          admin.yesyesList?.includes(staff.id)
        ) {
          currentRelationships.push({
            attendeeOneId: staff.id,
            attendeeTwoId: admin.id,
          });
        }
      }
    }
    //confirming relationship of staff/staff
    for (const staff1 of this.staff) {
      for (const staff2 of this.staff) {
        if (
          staff1.yesyesList?.includes(staff2.id) &&
          staff2.yesyesList?.includes(staff1.id) &&
          staff1.id !== staff2.id
        ) {
          currentRelationships.push({
            attendeeOneId: staff1.id,
            attendeeTwoId: staff2.id,
          });
        }
      }
    }
    //confirming relationship of admin/admin
    for (const admin1 of this.admins) {
      for (const admin2 of this.admins) {
        if (
          admin1.yesyesList?.includes(admin2.id) &&
          admin2.yesyesList?.includes(admin1.id) &&
          admin1.id !== admin2.id
        ) {
          currentRelationships.push({
            attendeeOneId: admin1.id,
            attendeeTwoId: admin2.id,
          });
        }
      }
    }
    this.relationships = currentRelationships;
    return currentRelationships;
  }

  //getting random periods (so we can assign these to staff/admin)
  private getRandomAvailablePeriod(
    assignedPeriods: Set<string>
  ): string | null {
    const availablePeriods = this.blocksToAssign.filter(
      (blockId) => !assignedPeriods.has(blockId)
    );
    if (availablePeriods.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * availablePeriods.length);
    return availablePeriods[randomIndex];
  }

  //checking if staff or admin is already assigned to a period off
  private isAssignedToPeriodOff(attendeeId: number): boolean {
    for (const blockId in this.schedule.blocks) {
      const periodsOff = this.schedule.blocks[blockId].periodsOff;
      if (periodsOff && periodsOff.includes(attendeeId)) {
        return true;
      }
    }
    return false;
  }

  //checking nono conflicts amonng staff
  private checkStaffNonoConflicts(
    staff: StaffAttendeeID,
    assignedStaffIds: number[]
  ): boolean {
    return assignedStaffIds.some((assignedId) =>
      staff.nonoList.includes(assignedId)
    );
  }

  //checking if a camper can participate in an found activity based on conflicts
  private canAssignCamperToActivity(
    camper: CamperAttendeeID,
    foundActivity: JamboreeActivity & { assignments: IndividualAssignments }
  ): boolean {
    // check nono list conflicts with other campers
    if (doesConflictExist(camper, foundActivity.assignments.camperIds)) {
      return false;
    }
    // check nono list conflicts with staff
    if (doesConflictExist(camper, foundActivity.assignments.staffIds)) {
      return false;
    }
    // check if nonolist conflicts with admins
    if (doesConflictExist(camper, foundActivity.assignments.adminIds)) {
      return false;
    }
    return true;
  }

  //HELPERS FOR IDENTIFYING SCHEDULING CONFLICTS IN PERIODS OFF

  // check if staff is on a period off on specific block
  private isStaffOnPeriodOff(staffId: number, blockId: string): boolean {
    const block = this.schedule.blocks[blockId];
    const periodOffList = block?.periodsOff;

    return !!periodOffList && periodOffList.includes(staffId);
  }

  // check if admin is on period off for a specific block
  private isAdminOnPeriodOff(adminId: number, blockId: string): boolean {
    const block = this.schedule.blocks[blockId];
    const periodOffList = block?.periodsOff;

    return !!periodOffList && periodOffList.includes(adminId);
  }

  //assigning admins to activity blocks
  assignAdmins(): NonBunkJamboreeScheduler {
    if (!this.guardBlocks()) return this;


    this.relationships = this.relationships.length
      ? this.relationships
      : this.staffAdminRelationship();
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      if (!currentBlock) {
        continue;
      }
      const availableAdmins = this.admins.filter(
        (a) => !this.isAdminOnPeriodOff(a.id, blockId)
      );
      const assignedAdminsThisBlock = new Set<number>();
      for (const activity of currentBlock.activities) {
        for (const aid of activity.assignments.adminIds)
          assignedAdminsThisBlock.add(aid);
      }

      for (const activity of currentBlock.activities) {
        if (activity.assignments.adminIds.length > 0) {
          continue;
        }
        let chosen: number | undefined;

        for (const admin of availableAdmins) {
          if (assignedAdminsThisBlock.has(admin.id)) {
            continue;
          }
          let ok = true;
          for (const sid of activity.assignments.staffIds) {
            const isRel = this.relationships.some(
              (r) => r.attendeeOneId === sid && r.attendeeTwoId === admin.id
            );
            if (isRel) {
              ok = false;
              break;
            }
          }
          if (!ok) {
            continue;
          }
          chosen = admin.id;
          break;
        }

        if (chosen === undefined && availableAdmins.length > 0) {
          const fallback = availableAdmins.find(
            (a) => !assignedAdminsThisBlock.has(a.id)
          );
          chosen = fallback?.id;
        }

        if (chosen !== undefined) {
          activity.assignments.adminIds.push(chosen);
          assignedAdminsThisBlock.add(chosen);
        }
      }
    }
    return this;
  }
}