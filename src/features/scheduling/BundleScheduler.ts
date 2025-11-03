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
  assignPeriodsOff() {
    // Ensure .periodsOff is present for each block id in the schedule
    for (const bId of Object.keys(this.schedule.blocks)) {
      this.schedule.blocks[bId].periodsOff = this.schedule.blocks[bId].periodsOff ?? [];
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
      .forEach(camper => {
        const candidateBlocks = this.blocksToAssign.filter(bId =>
          ['C', 'D', 'E'].includes(bId) &&
          this.schedule.blocks[bId]?.activities?.some(act => act.programArea.id === 'TC')
        );

        if (candidateBlocks.length === 0) return;

        const blockId = candidateBlocks[Math.floor(Math.random() * candidateBlocks.length)];
        const block = this.schedule.blocks[blockId];
        const teenChatActivity = block.activities.find(act => act.programArea.id === 'TC');

        // Clear this camper from Teen Chat in candidate blocks only
        candidateBlocks.forEach(candidateBlockId => {
          const candidateBlock = this.schedule.blocks[candidateBlockId];
          candidateBlock?.activities
            ?.filter(activity => activity.programArea.id === 'TC')
            .forEach(activity => {
              activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
            });
        });

        // Also clear this camper from all activities in the chosen block (to replace with TC)
        block.activities.forEach(activity => {
          activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
        });

        if (teenChatActivity) {
          teenChatActivity.assignments.camperIds.push(camper.id);
        } else {
          // Optionally create teen chat activity if absent:
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

    this.campers.forEach(camper => {
      const swimBlocks = this.blocksToAssign.filter(bId =>
        this.schedule.blocks[bId]?.activities?.some(act => act.programArea.id === WATERFRONT_AREA_ID)
      );

      let requiredBlocks: string[] = [];

      if (camper.ageGroup === 'NAV') {
        requiredBlocks = swimBlocks; // if blocksToAssign is the bundle this is ok
      } else if (camper.ageGroup === 'OCP') {
        if (this.bundleNum === 1) {
          requiredBlocks = swimBlocks;
        } else {
          if (camper.level <= 3 || !camper.swimOptOut) {
            requiredBlocks = swimBlocks;
          }
        }
      }

      requiredBlocks.forEach(blockId => {
        const block = this.schedule.blocks[blockId];
        if (!block) return;

        // Remove camper from all other activities in this block
        block.activities.forEach(activity => {
          activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
        });

        // Reuse existing Waterfront activity if present
        let waterfrontActivity = block.activities.find(act => act.programArea.id === WATERFRONT_AREA_ID);

        if (!waterfrontActivity) {
          waterfrontActivity = {
            name: 'Waterfront',
            description: 'Swimming block',
            programArea: { id: WATERFRONT_AREA_ID, name: 'Waterfront', isDeleted: false },
            // choose an appropriate ageGroup for the block (or leave undefined)
            ageGroup: camper.ageGroup,
            assignments: { camperIds: [], staffIds: [], adminIds: [] }
          };
          block.activities.push(waterfrontActivity);
        }

        if (!waterfrontActivity.assignments.camperIds.includes(camper.id)) {
          waterfrontActivity.assignments.camperIds.push(camper.id);
        }
      });
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

      // Assign program area counselors first
      const availableStaff = this.staff.filter(staff => {
        if (block.periodsOff.includes(staff.id)) return false;

        const areaId = staff.programCounselor?.id;
        const activity = areaId && activities.find(act => act.programArea.id === areaId);

        if (activity) {
          activity.assignments.staffIds.push(staff.id);
          return false;
        }

        return true;
      });

      // Shuffle remaining staff
      for (let i = availableStaff.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableStaff[i], availableStaff[j]] = [availableStaff[j], availableStaff[i]];
      }

      // Track how many staff each activity ideally needs
      const targetStaffCount: number[] = activities.map(act => act.assignments.camperIds.length);

      // First pass: assign staff to activities that need them
      const unassignedStaff: StaffAttendeeID[] = [];
      for (const staff of availableStaff) {
        const activity = activities.find((act, i) =>
          act.assignments.staffIds.length < targetStaffCount[i] &&
          !doesConflictExist(staff, [...act.assignments.camperIds, ...act.assignments.staffIds, ...act.assignments.adminIds])
        );
        if (activity) activity.assignments.staffIds.push(staff.id);
        else unassignedStaff.push(staff);
      }

      // Second pass: evenly distribute remaining staff to minimize exceeding 1:1 ratio
      while (unassignedStaff.length) {
        const staff = unassignedStaff.pop()!;
        
        // Find the activity with the lowest staff-to-camper ratio where staff can be assigned
        const eligibleActivities = activities
          .filter(act => !doesConflictExist(staff, [...act.assignments.camperIds, ...act.assignments.staffIds, ...act.assignments.adminIds]))
          .sort((a, b) => (a.assignments.staffIds.length / a.assignments.camperIds.length) - (b.assignments.staffIds.length / b.assignments.camperIds.length));

        if (eligibleActivities.length > 0) {
          eligibleActivities[0].assignments.staffIds.push(staff.id);
        } else {
          console.warn(`Could not assign staff ${staff.id} due to conflicts.`);
        }
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

      // Build array of available admins
      const availableAdmins = this.admins.filter(
        admin => !block.periodsOff.includes(admin.id)
      );

      // Shuffle admins for fairness
      for (let i = availableAdmins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableAdmins[i], availableAdmins[j]] = [availableAdmins[j], availableAdmins[i]];
      }

      let activityIndex = 0;

      // First pass: ensure at least 1 admin per activity
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
          // Remove assigned admin from pool
          availableAdmins.splice(availableAdmins.indexOf(admin), 1);
        } else {
          console.warn(`Could not assign admin to activity ${activity.name} due to conflicts.`);
        }
      }

      // Second pass: assign remaining admins to balance load
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