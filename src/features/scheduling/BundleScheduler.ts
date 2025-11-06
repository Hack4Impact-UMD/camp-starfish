import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SectionPreferences, ProgramAreaID } from "@/types/sessionTypes";
import moment from "moment";
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
    Each `programArea` needs a staff member (`StaffAttendeeID`) to be in charge.
    This function assigns the given programArea to the corresponding staff member.
  */
  assignProgramAreaCounselor(programArea: ProgramAreaID, staffID: StaffAttendeeID): void {
    staffID.programCounselor = programArea;
  }

  /* Each staff member and admin needs to have 1 period off per day */
  /* Each staff member and admin needs to have 1 period off per day */
  assignPeriodsOff() {
    // Build helper maps and sets
    const people = [...this.staff, ...this.admins]; // StaffAttendeeID[] | AdminAttendeeID[]
    const peopleById = new Map<number, (StaffAttendeeID | AdminAttendeeID)>();
    people.forEach(p => peopleById.set(p.id, p));

    // Build relationship pairs from yesyesList (mutual or one-way is fine)
    const relationships: Array<{ personAId: number; personBId: number }> = [];
    for (const p of people) {
      if (!p.yesyesList || !Array.isArray(p.yesyesList)) continue;
      for (const otherId of p.yesyesList) {
        if (!peopleById.has(otherId)) continue;
        // normalize ordering to avoid duplicates
        const a = Math.min(p.id, otherId);
        const b = Math.max(p.id, otherId);
        // only push unique
        if (!relationships.some(r => r.personAId === a && r.personBId === b)) {
          relationships.push({ personAId: a, personBId: b });
        }
      }
    }

    // Track who already has a period off (staff + admin ids)
    const assignedPeople = new Set<number>();

    let blockIndex = 0;

    const allStaffCount = this.staff.length;
    const allAdminCount = this.admins.length;

    // helper: check if a given staff/admin is disallowed to be off for this block
    const isProgramCounselorBlockedInBlock = (personId: number, block: any) => {
      // only staff have programCounselor set (per types), admins do not
      const p = peopleById.get(personId) as StaffAttendeeID | AdminAttendeeID | undefined;
      if (!p) return false;
      // @ts-ignore programCounselor only exists on staff; ignore if absent
      const programCounselor = (p as StaffAttendeeID).programCounselor;
      if (!programCounselor || !programCounselor.id) return false;

      // if the block contains any activity whose programArea id matches this staff member's programCounselor, they can't be off
      return !!block.activities?.some((act: any) => act.programArea?.id === programCounselor.id);
    };

    // Helper to compute campersCount for block
    const campersCountForBlock = (block: any) =>
      (block.activities || []).reduce((sum: number, act: any) => sum + (act.assignments?.camperIds?.length || 0), 0);

    // Helper to count how many admins must remain in this block (1 per activity)
    const requiredAdminsForBlock = (block: any) => (block.activities || []).length;

    // Ensure block.periodsOff exists
    for (const bId of this.blocksToAssign) {
      const blk = this.schedule.blocks[bId];
      if (blk && !Array.isArray(blk.periodsOff)) blk.periodsOff = [];
    }

    // 1) Assign periods off for relationships first (try to give both people same block off)
    for (const rel of relationships) {
      if (assignedPeople.has(rel.personAId) || assignedPeople.has(rel.personBId)) continue;

      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      const block = this.schedule.blocks[blockId];
      if (!block) continue;

      // If either person is a staff who is a program-area counselor for an activity in this block, skip this block for that person
      if (isProgramCounselorBlockedInBlock(rel.personAId, block) || isProgramCounselorBlockedInBlock(rel.personBId, block)) {
        // try next block instead of completely skipping relationship
        blockIndex++;
        continue;
      }

      const campersCount = campersCountForBlock(block);
      // staffAvailable: count of staff not program-counselor-blocked for this block and not already counted in block.periodsOff
      const staffBlocked = this.staff.filter(s => isProgramCounselorBlockedInBlock(s.id, block)).length;
      const currentPeriodsOff = (block.periodsOff || []).length;
      const staffAvailable = allStaffCount - staffBlocked - currentPeriodsOff - 2; // reserving 2 for this relation

      // admins available after hypothetical assignment (we must keep at least 1 admin per activity)
      const requiredAdmins = requiredAdminsForBlock(block);
      const adminsCurrentlyOff = (block.periodsOff || []).filter((id: number) => this.admins.some(a => a.id === id)).length;
      const adminsAvailableIfAssigned = allAdminCount - adminsCurrentlyOff; // we'll avoid assigning admins in relationships if it endangers requiredAdmins below
      if (staffAvailable >= campersCount && adminsAvailableIfAssigned >= requiredAdmins) {
        block.periodsOff = [...(block.periodsOff || []), rel.personAId, rel.personBId];
        assignedPeople.add(rel.personAId);
        assignedPeople.add(rel.personBId);
        blockIndex++;
      } else {
        // move to next block to attempt assignment there
        blockIndex++;
      }
    }

    // 2) Assign remaining staff (skip staff who are program-area counselors for blocks that contain their area)
    for (const s of this.staff) {
      if (assignedPeople.has(s.id)) continue;

      const startIndex = blockIndex;
      let attempts = 0;
      let assigned = false;

      // try each block in round-robin until assigned or tried all blocks
      while (attempts < this.blocksToAssign.length && !assigned) {
        const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
        const block = this.schedule.blocks[blockId];
        blockIndex++;
        attempts++;

        if (!block) continue;

        // cannot assign off if program counselor for an activity in this block
        if (isProgramCounselorBlockedInBlock(s.id, block)) continue;

        const campersCount = campersCountForBlock(block);
        const staffBlocked = this.staff.filter(st => isProgramCounselorBlockedInBlock(st.id, block)).length;
        const currentPeriodsOff = (block.periodsOff || []).length;
        const staffAvailable = allStaffCount - staffBlocked - currentPeriodsOff - 1; // minus 1 for this staff
        const requiredAdmins = requiredAdminsForBlock(block);
        const adminsCurrentlyOff = (block.periodsOff || []).filter((id: number) => this.admins.some(a => a.id === id)).length;
        const adminsAvailableIfAssigned = allAdminCount - adminsCurrentlyOff;

        if (staffAvailable >= campersCount && adminsAvailableIfAssigned >= requiredAdmins) {
          block.periodsOff = [...(block.periodsOff || []), s.id];
          assignedPeople.add(s.id);
          assigned = true;
        }
      }

      // continue to next staff
    }

    // 3) Assign remaining admins (but keep at least 1 admin per activity in the block)
    // We'll allow giving admins off only up to admins.length - requiredAdminsForBlock(block)
    for (const a of this.admins) {
      if (assignedPeople.has(a.id)) continue;

      const startIndex = blockIndex;
      let attempts = 0;
      let assigned = false;

      while (attempts < this.blocksToAssign.length && !assigned) {
        const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
        const block = this.schedule.blocks[blockId];
        blockIndex++;
        attempts++;

        if (!block) continue;

        const requiredAdmins = requiredAdminsForBlock(block);
        const adminsCurrentlyOff = (block.periodsOff || []).filter((id: number) => this.admins.some(ad => ad.id === id)).length;
        const adminsAvailableIfAssigned = allAdminCount - (adminsCurrentlyOff + 1); // if we give this admin off

        // Only assign admin off if after assignment we still have >= requiredAdmins admins available
        if (adminsAvailableIfAssigned >= requiredAdmins) {
          block.periodsOff = [...(block.periodsOff || []), a.id];
          assignedPeople.add(a.id);
          assigned = true;
        }
      }
    }

    return this;
  }


  /*
    Assign a camper (CamperAttendeeID) to the "Teen Chat" activity in the given block.
    Also update the block's`IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
assignOCPChats(): void {
  this.campers
    .filter(camper => camper.ageGroup === 'OCP')
    .forEach((camper, index) => {
      // Filter out any block the camper is off for
      const candidateBlocks = this.blocksToAssign.filter(bId =>
        ['C', 'D', 'E'].includes(bId) &&
        this.schedule.blocks[bId]?.activities?.some(act => act.programArea.id === 'TC')
      );

      if (candidateBlocks.length === 0) return;

      // Instead of random, use even distribution
      const blockId = candidateBlocks[index % candidateBlocks.length];
      const block = this.schedule.blocks[blockId];
      const teenChatActivity = block.activities.find(act => act.programArea.id === 'TC');

      // Clear camper from Teen Chat in all candidate blocks
      candidateBlocks.forEach(candidateBlockId => {
        const candidateBlock = this.schedule.blocks[candidateBlockId];
        candidateBlock?.activities
          ?.filter(activity => activity.programArea.id === 'TC')
          .forEach(activity => {
            activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
          });
      });

      // Remove camper from all other activities in chosen block
      block.activities.forEach(activity => {
        activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
      });

      if (teenChatActivity) {
        teenChatActivity.assignments.camperIds.push(camper.id);
      } else {
        block.activities.push({
          name: 'Teen Chat',
          description: 'OCP chat',
          programArea: { id: 'TC', name: 'Teen Chat', isDeleted: false },
          ageGroup: 'OCP',
          assignments: { camperIds: [camper.id], staffIds: [], adminIds: [] }
        });
      }
    });
}





  /*
    Assign campers (CamperAttendeeID[]) to the "Waterfront" activity in the given block. 
    Also update the block's `IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
assignSwimmingBlock(): void {
  const WATERFRONT_AREA_ID = 'WF';
  const swimBlocks = this.blocksToAssign.filter(bId =>
    this.schedule.blocks[bId]?.activities?.some(act => act.programArea.id === WATERFRONT_AREA_ID)
  );

  this.campers.forEach((camper, index) => {
    let candidateBlocks: string[] = [];

    if (camper.ageGroup === 'NAV') {
      candidateBlocks = swimBlocks;
    } else if (camper.ageGroup === 'OCP') {
      if (this.bundleNum === 1 || (camper.level <= 3 || !camper.swimOptOut)) {
        candidateBlocks = swimBlocks;
      }
    }
    if (candidateBlocks.length === 0) return;

    // Distribute evenly so they only get 1
    const blockId = candidateBlocks[index % candidateBlocks.length];
    const block = this.schedule.blocks[blockId];
    if (!block) return;

    // Remove camper from all activities in that block
    block.activities.forEach(activity => {
      activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
    });

    let waterfrontActivity = block.activities.find(act => act.programArea.id === WATERFRONT_AREA_ID);
    if (!waterfrontActivity) {
      waterfrontActivity = {
        name: 'Waterfront',
        description: 'Swimming block',
        programArea: { id: WATERFRONT_AREA_ID, name: 'Waterfront', isDeleted: false },
        ageGroup: camper.ageGroup,
        assignments: { camperIds: [], staffIds: [], adminIds: [] }
      };
      block.activities.push(waterfrontActivity);
    }

    if (!waterfrontActivity.assignments.camperIds.includes(camper.id)) {
      waterfrontActivity.assignments.camperIds.push(camper.id);
    }
  });
}




  assignCampers() {
    const MIN_CAMPERS = 4;
    const IDEAL_MIN = 5;
    const IDEAL_MAX = 8;
    const MAX_CAMPERS = 9;

    for (const blockID of this.blocksToAssign) {
      const block = this.schedule.blocks[blockID];
      if (!block) throw new Error("Invalid block");

      const activities = block.activities;
      if (!activities?.length) throw new Error("Block has no activities");

      const sortedCampers = [...this.campers].sort((a, b) =>
        moment(a.dateOfBirth).diff(moment(b.dateOfBirth))
      );

      const unassigned: CamperAttendeeID[] = [];

      for (const camper of sortedCampers) {
        // Skip if camper already has Swim or OCP Chat in this block
        const alreadyAssigned = activities.some(
          act =>
            act.assignments.camperIds.includes(camper.id) &&
            (act.programArea.name === "Waterfront" || act.programArea.name === "Teens")
        );
        if (alreadyAssigned) continue;

        const camperPrefsForBlock = this.camperPrefs[blockID]?.[camper.id];
        if (!camperPrefsForBlock) {
          unassigned.push(camper);
          continue;
        }

        const activityIDsByPref = Object.entries(camperPrefsForBlock)
          .sort(([, a], [, b]) => a - b)
          .map(([id]) => id);

        let assigned = false;

        for (const activityId of activityIDsByPref) {
          const activity = activities.find(act =>
            act.name === activityId && act.ageGroup === camper.ageGroup
          );

          if (
            !activity ||
            activity.assignments.camperIds.length >= IDEAL_MAX ||
            doesConflictExist(camper, [
              ...activity.assignments.camperIds,
              ...activity.assignments.staffIds,
              ...activity.assignments.adminIds,
            ])
          ) continue;

          activity.assignments.camperIds.push(camper.id);
          assigned = true;
          break;
        }

        if (!assigned) unassigned.push(camper);
      }

      // Fallback pass for unassigned campers
      for (const camper of unassigned) {
        const available = activities.find(
          act =>
            act.ageGroup === camper.ageGroup &&
            act.assignments.camperIds.length < MAX_CAMPERS
        );

        if (available) {
          available.assignments.camperIds.push(camper.id);
        } else {
          const sameGroup = activities.filter(a => a.ageGroup === camper.ageGroup);
          if (sameGroup.length > 0) {
            const leastFull = sameGroup.reduce((a, b) =>
              a.assignments.camperIds.length < b.assignments.camperIds.length ? a : b
            );
            leastFull.assignments.camperIds.push(camper.id);
          } else {
            console.warn(`⚠️ No suitable activity found for camper ${camper.id} in block ${blockID}`);
          }
        }
      }

      // Balancing pass
      const underfilled = activities.filter(a => a.assignments.camperIds.length < MIN_CAMPERS);
      const overfilled = activities.filter(a => a.assignments.camperIds.length > MAX_CAMPERS);

      for (const low of underfilled) {
        for (const high of overfilled) {
          while (
            low.assignments.camperIds.length < IDEAL_MIN &&
            high.assignments.camperIds.length > IDEAL_MAX
          ) {
            const movedCamper = high.assignments.camperIds.pop();
            if (movedCamper) low.assignments.camperIds.push(movedCamper);
          }
        }
      }
    }
  }


  // Assigns staff randomly to each activity in the given block, aiming for a 1:1 ratio
assignStaff() {
  for (const blockID of this.blocksToAssign) {
    const block = this.schedule.blocks[blockID];
    if (!block) throw new Error("Invalid block");

    const activities = block.activities;
    if (!activities?.length) throw new Error("Block has no activities");

    const periodsOff = block.periodsOff || [];

    // Step 1: Assign program area counselors first
    const remainingStaff = this.staff.filter(staff => {
      if (periodsOff.includes(staff.id)) return false; // skip if off

      const areaId = staff.programCounselor?.id;
      const activity = areaId && activities.find(act => act.programArea.id === areaId);

      if (activity) {
        activity.assignments.staffIds.push(staff.id);
        return false;
      }
      return true;
    });

    // Step 2: Shuffle remaining staff for fairness
    for (let i = remainingStaff.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingStaff[i], remainingStaff[j]] = [remainingStaff[j], remainingStaff[i]];
    }

    // Step 3: Calculate desired staff count per activity (based on camper count)
    const camperCounts = activities.map(a => a.assignments.camperIds.length);
    const totalCampers = camperCounts.reduce((a, b) => a + b, 0);
    const totalStaff = remainingStaff.length;

    const targetStaffPerActivity = activities.map(a => {
      const ratio = totalCampers > 0 ? a.assignments.camperIds.length / totalCampers : 0;
      return Math.max(1, Math.round(ratio * totalStaff)); // at least one staff per activity
    });

    // Step 4: Sort activities dynamically by current staff/camper ratio
    const unassignedStaff: StaffAttendeeID[] = [];

    for (const staff of remainingStaff) {
      // Pick the activity that currently has the *worst* ratio (most understaffed)
      const eligibleActivities = activities
        .filter(act =>
          !doesConflictExist(staff, [
            ...act.assignments.camperIds,
            ...act.assignments.staffIds,
            ...act.assignments.adminIds,
          ])
        )
        .sort((a, b) => {
          const aRatio =
            a.assignments.staffIds.length / (a.assignments.camperIds.length || 1);
          const bRatio =
            b.assignments.staffIds.length / (b.assignments.camperIds.length || 1);
          return aRatio - bRatio; // lower ratio = more in need
        });

      if (eligibleActivities.length > 0) {
        const chosen = eligibleActivities[0];
        chosen.assignments.staffIds.push(staff.id);
      } else {
        unassignedStaff.push(staff);
      }
    }

    // Step 5: Assign any remaining unplaced staff to least-staffed activity (just to ensure full coverage)
    while (unassignedStaff.length) {
      const staff = unassignedStaff.pop()!;
      const leastStaffed = activities.reduce((prev, curr) =>
        prev.assignments.staffIds.length < curr.assignments.staffIds.length
          ? prev
          : curr
      );
      leastStaffed.assignments.staffIds.push(staff.id);
    }
  }
}



  // Assigns admin staff randomly to each activity in the given block
  assignAdmin() {
    for (const blockID of this.blocksToAssign) {
      const block = this.schedule.blocks[blockID];
      if (!block) throw new Error("Invalid block");

      const activities = block.activities;
      if (!activities?.length) throw new Error("Block has no activities");

      const periodsOff = block.periodsOff || [];

      // ✅ skip admins who are off
      const availableAdmins = this.admins.filter(
        admin => !periodsOff.includes(admin.id)
      );

      // Shuffle for fairness
      for (let i = availableAdmins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableAdmins[i], availableAdmins[j]] = [availableAdmins[j], availableAdmins[i]];
      }

      let activityIndex = 0;

      // First pass: ensure at least one admin per activity
      for (const activity of activities) {
        const admin = availableAdmins.find(a =>
          !doesConflictExist(a, [
            ...activity.assignments.camperIds,
            ...activity.assignments.staffIds,
            ...activity.assignments.adminIds,
          ])
        );

        if (admin) {
          activity.assignments.adminIds.push(admin.id);
          availableAdmins.splice(availableAdmins.indexOf(admin), 1);
        } else {
          console.warn(`Could not assign admin to activity ${activity.name} due to conflicts.`);
        }
      }

      // Second pass: balance remaining admins
      while (availableAdmins.length) {
        const admin = availableAdmins.pop()!;
        const startIdx = activityIndex;

        const activity = activities.find((_, i) => {
          const idx = (i + startIdx) % activities.length;
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