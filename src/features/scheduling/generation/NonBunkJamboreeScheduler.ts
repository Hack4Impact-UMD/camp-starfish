/* Campers have been assigned individually instead of by bunk*/
import {
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  SectionSchedule,
  SectionPreferences,
  JamboreeActivity,
  IndividualAssignments,
} from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";

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

  //relationships more generic to include staff/admin, staff/staff, admin/admin, camper/camper, camper/staff, camper/admin
  private relationships: Array<{ attendeeOneId: number; attendeeTwoId: number;}> = [];

  constructor() {}

  withSchedule(
    schedule: SectionSchedule<"NON-BUNK-JAMBO">
  ): NonBunkJamboreeScheduler {
    this.schedule = schedule;
    return this;
  }

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

  // each staff member & admin must have 1 period off per day
  private guardBlocks(): boolean {
    //checking length of blocks as a guard clause, called in every assignment function
    if (this.blocksToAssign.length === 0) {
      this.blocksToAssign = Object.keys(this.schedule.blocks);
    }
    return this.blocksToAssign.length > 0;
  }

  // gets the total number of campers in a block

  private getCamperCount(blockId: string): number {
    const block = this.schedule.blocks[blockId];
    if (!block) {
      return 0;
    }
    return block.activities.reduce(
      (sum, activity) => sum + activity.assignments.camperIds.length,
      0
    );
  }

  assignPeriodsOff(): NonBunkJamboreeScheduler {
    if (!this.guardBlocks()) return this;

    this.relationships = this.relationships.length
      ? this.relationships
      : this.staffAdminRelationship();

    // get unassigned/assigned staff and admins
    const assignedStaff = new Set(
      this.relationships.map((r) => r.attendeeOneId)
    );
    const assignedAdmins = new Set(
      this.relationships.map((r) => r.attendeeTwoId)
    );
    const unassignedStaff = this.staff.filter((s) => !assignedStaff.has(s.id));
    const unassignedAdmins = this.admins.filter((a) => !assignedAdmins.has(a.id));

    // helper function to find best block for period off
    const findBestBlock = (isAdmin = false) => {
      let bestBlock = "";
      let bestCamperCount = -1;

      for (const blockId of this.blocksToAssign) {
        const block = this.schedule.blocks[blockId];
        if (!block) continue;

        const staffCount = this.staff.length - (block.periodsOff?.length || 0);
        const camperCount = this.getCamperCount(blockId);
        const maxCampers = isAdmin ? staffCount : staffCount - 1;

        // skip if assigning would break 1:1 ratio
        if (camperCount > maxCampers) {
          continue;
        }

        // prefer blocks with more campers to balance
        if (camperCount > bestCamperCount) {
          bestCamperCount = camperCount;
          bestBlock = blockId;
        }
      }

      return bestBlock;
    };

    // assign periods off for relationships
    for (const { attendeeOneId, attendeeTwoId } of this.relationships) {
      const bestBlock = findBestBlock();
      if (bestBlock) {
        if (!this.schedule.blocks[bestBlock].periodsOff) {
          this.schedule.blocks[bestBlock].periodsOff = [];
        }
        this.schedule.blocks[bestBlock].periodsOff.push(
          attendeeOneId,
          attendeeTwoId
        );
      }
    }

    // assign periods off for unassigned staff and admins
    const assignPeriods = (ids: number[], isAdmin = false) => {
      for (const id of ids) {
        const bestBlock = findBestBlock(isAdmin);
        if (bestBlock) {
          if (!this.schedule.blocks[bestBlock].periodsOff) {
            this.schedule.blocks[bestBlock].periodsOff = [];
          }
          this.schedule.blocks[bestBlock].periodsOff.push(id);
        }
      }
    };

    assignPeriods(unassignedStaff.map((s) => s.id));
    assignPeriods(unassignedAdmins.map((a) => a.id), true);

    return this;
  }

  /*
   assigns campers to activities while maintaining 1:1 staff-to-camper ratio
   ensures we never have more campers than available staff in any block
   */
  assignCampers(): NonBunkJamboreeScheduler {
    if (!this.guardBlocks()) return this;

    for (const blockId of this.blocksToAssign) {
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      const blockPrefs = this.camperPrefs[blockId] || {};

      // get unassigned campers sorted by their highest preference
      const unassignedCampers = this.campers
        .filter(
          (c) =>
            !block.activities.some((a) =>
              a.assignments.camperIds.includes(c.id)
            )
        )
        .sort(
          (a, b) =>
            Math.max(0, ...Object.values(blockPrefs[b.id] || {})) -
            Math.max(0, ...Object.values(blockPrefs[a.id] || {}))
        );

      // ensure minimum campers per activity (4)
      for (const activity of block.activities) {
        while (
          activity.assignments.camperIds.length < MIN_CAMPERS_PER_ACTIVITY &&
          unassignedCampers.length > 0
        ) {
          const camper = unassignedCampers.shift()!;
          if (this.canAssignCamperToActivity(camper, activity)) {
            activity.assignments.camperIds.push(camper.id);
          }
        }
      }

      // distribute remaining campers
      for (const camper of unassignedCampers) {
        // find activities that aren't full between the range
        const availableActivities = block.activities.filter(
          (a) => a.assignments.camperIds.length < MAX_CAMPERS_PER_ACTIVITY
        );

        // 1. try to fill activities below ideal minimum (4)
        let targetActivity = availableActivities.find(
          (a) => a.assignments.camperIds.length < IDEAL_MIN_CAMPERS
        );

        // 2. if none, find activity with highest preference that's not full
        if (!targetActivity) {
          targetActivity = [...availableActivities].sort((a, b) => {
            // sort by preference, then by fewest campers
            const aPref = blockPrefs[camper.id]?.[a.name] || 0;
            const bPref = blockPrefs[camper.id]?.[b.name] || 0;
            return (
              bPref - aPref ||
              a.assignments.camperIds.length - b.assignments.camperIds.length
            );
          })[0];
        }
        if (
          targetActivity &&
          this.canAssignCamperToActivity(camper, targetActivity)
        ) {
          targetActivity.assignments.camperIds.push(camper.id);
        }
      }
    }
    return this;
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