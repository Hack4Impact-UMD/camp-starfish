import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, SectionPreferences, ProgramAreaID } from "@/types/sessionTypes";

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





  assignCampers() { return this; }

  assignStaff() { return this; }

  assignAdmins() { return this; }
}