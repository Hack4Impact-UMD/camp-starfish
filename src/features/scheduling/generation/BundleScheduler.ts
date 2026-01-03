import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SectionPreferences, ProgramAreaID, BundleActivity } from "@/types/sessionTypes";
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
    this.campers
      .filter(camper => camper.ageGroup === 'OCP')
      .forEach(camper => {
        const candidateBlocks = this.blocksToAssign.filter(bId =>
          ['C', 'D', 'E'].includes(bId) &&
          this.schedule.blocks[bId]?.activities.some(act => act.programArea.id === 'TC')
        );

        if (candidateBlocks.length === 0) return;

        const blockId = candidateBlocks[Math.floor(Math.random() * candidateBlocks.length)];
        const block = this.schedule.blocks[blockId];
        const teenChatActivity = block.activities.find(act => act.programArea.id === 'TC');

        // First, clear this camper from every Teen Chat in all candidate blocks
        this.blocksToAssign.forEach(candidateBlockId => {
          const candidateBlock = this.schedule.blocks[candidateBlockId];
          candidateBlock?.activities
            ?.filter(activity => activity.programArea.id === 'TC')
            .forEach(activity => {
              activity.assignments.camperIds = activity.assignments.camperIds.filter(
                id => id !== camper.id
              );
            });
        });
        // Then, clean out this camper from all activities in the currently selected block
        block.activities.forEach(activity => {
          activity.assignments.camperIds = activity.assignments.camperIds.filter(
            id => id !== camper.id
          );
        });
        // Finally, assign the camper to the Teen Chat in the chosen block
        if (teenChatActivity) {
          teenChatActivity.assignments.camperIds.push(camper.id);
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
        this.schedule.blocks[bId]?.activities.some(
          act => act.programArea.id === WATERFRONT_AREA_ID
        )
      );

      let requiredBlocks: string[] = [];

      if (camper.ageGroup === 'NAV') {
        // NAV campers swim in all blocks that include Waterfront
        requiredBlocks = swimBlocks;
      } else if (camper.ageGroup === 'OCP') {
        if (this.bundleNum === 1) {
          // First bundle: All OCP campers swim
          requiredBlocks = swimBlocks;
        } else {
          // After first bundle: based on level and opt-out preference
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
          if (activity.assignments?.camperIds) {
            activity.assignments.camperIds = activity.assignments.camperIds.filter(
              id => id !== camper.id
            );
          }
        });

        // Find or create the Waterfront activity by Program Area ID
        let waterfrontActivity = block.activities.find(
          act => act.programArea.id === WATERFRONT_AREA_ID
        );

        // If Waterfront activity doesn't exist (failsafe)
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

        // Add camper to the Waterfront activity
        if (!waterfrontActivity.assignments.camperIds.includes(camper.id)) {
          waterfrontActivity.assignments.camperIds.push(camper.id);
        }
      });
    });
  }

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