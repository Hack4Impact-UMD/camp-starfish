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

export class NonBunkJamboreeScheduler {
  schedule: SectionSchedule<"NON-BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  camperPrefs: SectionPreferences = {};
  blocksToAssign: string[] = [];

  constructor() {}

  withSchedule(schedule: SectionSchedule<"NON-BUNK-JAMBO">) {
    this.schedule = schedule;
    return this;
  }

  withCampers(campers: CamperAttendeeID[]) {
    this.campers = campers;
    return this;
  }

  withStaff(staff: StaffAttendeeID[]) {
    this.staff = staff;
    return this;
  }

  withAdmins(admins: AdminAttendeeID[]) {
    this.admins = admins;
    return this;
  }

  withCamperPrefs(camperPrefs: SectionPreferences) {
    this.camperPrefs = camperPrefs;
    return this;
  }

  forBlocks(blockIds: string[]) {
    this.blocksToAssign = blockIds;
    return this;
  }

  // ------------------------
  // Periods Off Assignment
  // ------------------------
  assignPeriodsOff() {
    const relationships = this.staffAdminRelationship();

    // Track everyone who has been assigned a period off (combined staff + admin)
    const assignedPeople = new Set<number>();

    let blockIndex = 0;

    // Assign periods off for relationships first
    for (const rel of relationships) {
      // Skip if either person already has a period off
      if (assignedPeople.has(rel.personAId) || assignedPeople.has(rel.personBId)) {
        continue;
      }

      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      // Only give periods off if enough staff remain for almost 1:1 coverage
      const campersCount = block.activities.reduce((sum, act) => sum + act.assignments.camperIds.length, 0);
      const staffAvailable = this.staff.length - (block.periodsOff?.length || 0) - 2; // minus 2 for this relationship
      if (staffAvailable >= campersCount) {
        block.periodsOff = [...(block.periodsOff || []), rel.personAId, rel.personBId];
        assignedPeople.add(rel.personAId);
        assignedPeople.add(rel.personBId);
        blockIndex++;
      }
    }

    // Assign remaining staff
    for (const s of this.staff) {
      if (assignedPeople.has(s.id)) continue;

      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      const campersCount = block.activities.reduce((sum, act) => sum + act.assignments.camperIds.length, 0);
      const staffAvailable = this.staff.length - (block.periodsOff?.length || 0) - 1;
      if (staffAvailable >= campersCount) {
        block.periodsOff = [...(block.periodsOff || []), s.id];
        assignedPeople.add(s.id);
        blockIndex++;
      }
    }

    // Assign remaining admins (no strict ratio needed)
    for (const a of this.admins) {
      if (assignedPeople.has(a.id)) continue;

      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      block.periodsOff = [...(block.periodsOff || []), a.id];
      assignedPeople.add(a.id);
      blockIndex++;
    }

    return this;
  }

  // ------------------------
  // Camper Assignment
  // ------------------------
  assignCampers() {
    const MIN_CAMPERS = 4;
    const IDEAL_MIN = 5;
    const IDEAL_MAX = 8;
    const MAX_CAMPERS = 9;

    for (const blockId of this.blocksToAssign) {
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      const blockPrefs = this.camperPrefs[blockId] || {};
      const assignedCampers = new Set<number>();

      // Sort campers by max preference for this block (descending)
      const campersOrdered = [...this.campers].sort((a, b) => {
        const aMax = Math.max(...Object.values(blockPrefs[a.id] || {}), 0);
        const bMax = Math.max(...Object.values(blockPrefs[b.id] || {}), 0);
        return bMax - aMax;
      });

      for (const camper of campersOrdered) {
        if (assignedCampers.has(camper.id)) continue;

        const camperPrefsForBlock = blockPrefs[camper.id] || {};
        // Sort activities by camper's preference
        const activitiesByPref = [...block.activities].sort((a, b) => {
          const aScore = camperPrefsForBlock[a.name] ?? 0;
          const bScore = camperPrefsForBlock[b.name] ?? 0;
          return bScore - aScore;
        });

        let placed = false;

        // Try preferred activities first, but prefer those under IDEAL_MAX
        for (const activity of activitiesByPref) {
          const currentCount = activity.assignments.camperIds.length;
          if (currentCount >= IDEAL_MAX) continue;
          if (!this.canAssignCamperToActivity(camper, activity)) continue;

          activity.assignments.camperIds.push(camper.id);
          assignedCampers.add(camper.id);
          placed = true;
          break;
        }

        // If not placed, try preferred activities up to MAX_CAMPERS
        if (!placed) {
          for (const activity of activitiesByPref) {
            const currentCount = activity.assignments.camperIds.length;
            if (currentCount >= MAX_CAMPERS) continue;
            if (!this.canAssignCamperToActivity(camper, activity)) continue;

            activity.assignments.camperIds.push(camper.id);
            assignedCampers.add(camper.id);
            placed = true;
            break;
          }
        }

        // Fallback to any activity under IDEAL_MAX
        if (!placed) {
          for (const activity of block.activities) {
            const currentCount = activity.assignments.camperIds.length;
            if (currentCount >= IDEAL_MAX) continue;
            if (!this.canAssignCamperToActivity(camper, activity)) continue;

            activity.assignments.camperIds.push(camper.id);
            assignedCampers.add(camper.id);
            placed = true;
            break;
          }
        }

        // Last resort: any activity under MAX_CAMPERS
        if (!placed) {
          for (const activity of block.activities) {
            const currentCount = activity.assignments.camperIds.length;
            if (currentCount >= MAX_CAMPERS) continue;
            if (!this.canAssignCamperToActivity(camper, activity)) continue;

            activity.assignments.camperIds.push(camper.id);
            assignedCampers.add(camper.id);
            break;
          }
        }
      }

      // Balance activities: move campers from overpopulated to underpopulated activities
      let balanceIterations = 0;
      while (balanceIterations < 10) {
        balanceIterations++;
        let madeChange = false;

        // Find activities that need campers
        const needCampers = block.activities.filter(a => a.assignments.camperIds.length < IDEAL_MIN);
        // Find activities with excess campers
        const hasExcess = block.activities.filter(a => a.assignments.camperIds.length > IDEAL_MAX);

        if (!needCampers.length || !hasExcess.length) break;

        for (const recipient of needCampers) {
          if (recipient.assignments.camperIds.length >= IDEAL_MIN) continue;

          for (const donor of hasExcess) {
            if (donor.assignments.camperIds.length <= IDEAL_MAX) continue;

            const movedCamper = donor.assignments.camperIds.pop();
            if (movedCamper !== undefined) {
              recipient.assignments.camperIds.push(movedCamper);
              madeChange = true;
              break;
            }
          }
        }

        if (!madeChange) break;
      }
    }

    return this;
  }

  // ------------------------
  // Counselor Assignment
  // ------------------------
  assignCounselors() {
    const relationships = this.staffAdminRelationship();
    const relMap = new Map<number, number>();
    for (const rel of relationships) relMap.set(rel.personAId, rel.personBId);

    for (const blockId of this.blocksToAssign) {
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      const assignedStaff = new Set<number>();
      for (const activity of block.activities) {
        activity.assignments.staffIds.forEach((id) => assignedStaff.add(id));
      }

      const availableStaff = this.staff.filter((s) => !this.isStaffOnPeriodOff(s.id, blockId));

      // Sort activities by need (descending) to prioritize worst ratios
      const activitiesByNeed = [...block.activities].sort((a, b) => {
        const aNeed = Math.max(0, a.assignments.camperIds.length - a.assignments.staffIds.length);
        const bNeed = Math.max(0, b.assignments.camperIds.length - b.assignments.staffIds.length);
        return bNeed - aNeed;
      });

      for (const activity of activitiesByNeed) {
        if (!activity.assignments.camperIds.length) continue;

        let need = Math.max(0, activity.assignments.camperIds.length - activity.assignments.staffIds.length);

        while (need > 0) {
          let placed = false;
          for (const staff of availableStaff) {
            if (assignedStaff.has(staff.id)) continue;
            if (this.checkStaffNonoConflicts(staff, activity.assignments.staffIds)) continue;

            const rel = relMap.get(staff.id);
            if (rel && activity.assignments.adminIds.includes(rel)) continue;

            activity.assignments.staffIds.push(staff.id);
            assignedStaff.add(staff.id);
            need--;
            placed = true;
            break;
          }
          if (!placed) break;
        }
      }

      // Second pass: redistribute staff from activities with good ratios to those far from 1:1
      let redistributeIterations = 0;
      while (redistributeIterations < 10) {
        redistributeIterations++;
        let madeChange = false;

        // Calculate ratios and find activities far from 1:1
        const activitiesWithRatios = block.activities
          .filter(a => a.assignments.camperIds.length > 0)
          .map(a => ({
            activity: a,
            ratio: a.assignments.camperIds.length / Math.max(1, a.assignments.staffIds.length),
            deviation: Math.abs(a.assignments.camperIds.length - a.assignments.staffIds.length)
          }));

        // Sort by ratio (descending) - activities with worst ratios first
        const needsRebalancing = activitiesWithRatios
          .filter(a => a.ratio > 1.5 || a.deviation > 2) // Ratio > 1.5:1 OR deviation > 2
          .sort((a, b) => b.ratio - a.ratio);

        // Activities with better ratios or extra staff
        const hasExtraStaff = activitiesWithRatios
          .filter(a => a.ratio <= 1 && a.activity.assignments.staffIds.length > 1)
          .sort((a, b) => a.ratio - b.ratio);

        if (!needsRebalancing.length || !hasExtraStaff.length) break;

        const recipient = needsRebalancing[0].activity;

        for (const donorInfo of hasExtraStaff) {
          const donor = donorInfo.activity;
          if (donor.assignments.staffIds.length <= 1) continue;

          // Check if we can move this staff without conflicts
          const staffToMove = donor.assignments.staffIds[donor.assignments.staffIds.length - 1];
          const staffObj = this.staff.find(s => s.id === staffToMove);
          if (!staffObj) continue;

          // Check nono conflicts
          if (this.checkStaffNonoConflicts(staffObj, recipient.assignments.staffIds)) continue;

          // Check relationship conflicts
          const rel = relMap.get(staffToMove);
          if (rel && recipient.assignments.adminIds.includes(rel)) continue;

          donor.assignments.staffIds.pop();
          recipient.assignments.staffIds.push(staffToMove);
          madeChange = true;
          break;
        }

        if (!madeChange) break;
      }
    }

    return this;
  }

  // ------------------------
  // Admin Assignment
  // ------------------------
  assignAdmins() {
    const relationships = this.staffAdminRelationship();

    for (const blockId of this.blocksToAssign) {
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      const availableAdmins = this.admins.filter((a) => !this.isAdminOnPeriodOff(a.id, blockId));

      for (const activity of block.activities) {
        if (activity.assignments.adminIds.length) continue;

        let chosen: number | undefined;
        for (const admin of availableAdmins) {
          const blocked = activity.assignments.staffIds.some((sid) =>
            relationships.some((r) => r.personAId === sid && r.personBId === admin.id)
          );
          if (!blocked) {
            chosen = admin.id;
            break;
          }
        }

        if (!chosen && availableAdmins.length) chosen = availableAdmins[0].id;
        if (chosen) activity.assignments.adminIds.push(chosen);
      }
    }

    return this;
  }

  // ------------------------
  // Get Schedule
  // ------------------------
  getSchedule() {
    return this.schedule;
  }

  // ------------------------
  // Helper Functions
  // ------------------------
  private staffAdminRelationship(): Array<{ personAId: number; personBId: number }> {
    const relationships: Array<{ personAId: number; personBId: number }> = [];

    // Staff-Admin
    for (const s of this.staff) {
      for (const a of this.admins) {
        if (s.yesyesList?.includes(a.id) && a.yesyesList?.includes(s.id)) {
          relationships.push({ personAId: s.id, personBId: a.id });
        }
      }
    }

    // Staff-Staff
    for (let i = 0; i < this.staff.length; i++) {
      for (let j = i + 1; j < this.staff.length; j++) {
        const a = this.staff[i],
          b = this.staff[j];
        if (a.yesyesList?.includes(b.id) && b.yesyesList?.includes(a.id)) {
          relationships.push({ personAId: a.id, personBId: b.id });
        }
      }
    }

    // Admin-Admin
    for (let i = 0; i < this.admins.length; i++) {
      for (let j = i + 1; j < this.admins.length; j++) {
        const a = this.admins[i],
          b = this.admins[j];
        if (a.yesyesList?.includes(b.id) && b.yesyesList?.includes(a.id)) {
          relationships.push({ personAId: a.id, personBId: b.id });
        }
      }
    }

    return relationships;
  }

  private checkStaffNonoConflicts(staff: StaffAttendeeID, assignedIds: number[]) {
    return assignedIds.some((id) => staff.nonoList.includes(id));
  }

  private canAssignCamperToActivity(camper: CamperAttendeeID, activity: JamboreeActivity & { assignments: IndividualAssignments }) {
    if (doesConflictExist(camper, activity.assignments.camperIds)) return false;
    if (doesConflictExist(camper, activity.assignments.staffIds)) return false;
    return true;
  }

  private isStaffOnPeriodOff(staffId: number, blockId: string) {
    const block = this.schedule.blocks[blockId];
    return !!block?.periodsOff?.includes(staffId);
  }

  private isAdminOnPeriodOff(adminId: number, blockId: string) {
    const block = this.schedule.blocks[blockId];
    return !!block?.periodsOff?.includes(adminId);
  }
}