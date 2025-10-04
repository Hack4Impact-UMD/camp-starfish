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
  assignOCPChats<T extends 'BUNDLE'>(camperAttendees: CamperAttendeeID[]): void {
    camperAttendees
      .filter(camper => camper.ageGroup === 'OCP')
      .forEach(camper => {
        const candidateBlocks = this.blocksToAssign.filter(bId =>
          ['C', 'D', 'E'].includes(bId) &&
          this.schedule.blocks[bId]?.activities.some(act => act.name === 'Teen Chat')
        );

        if (candidateBlocks.length === 0) return;

        const blockId = candidateBlocks[Math.floor(Math.random() * candidateBlocks.length)];
        const block = this.schedule.blocks[blockId];
        const teenChatActivity = block.activities.find(act => act.name === 'Teen Chat');

        if (!teenChatActivity) return;

        block.activities.forEach(activity => {
          activity.assignments.camperIds = activity.assignments.camperIds.filter(id => id !== camper.id);
        });

        teenChatActivity.assignments.camperIds.push(camper.id);
      });
  }




  /*
    Assign campers (CamperAttendeeID[]) to the "Waterfront" activity in the given block. 
    Also update the block's `IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignSwimmingBlock<T extends 'BUNDLE'>(camperAttendees: CamperAttendeeID[]): void {
    camperAttendees.forEach(camper => {
      let requiredBlocks: string[] = [];

      if (camper.ageGroup === 'NAV') {
        requiredBlocks = this.blocksToAssign.filter(bId => ['C', 'D', 'E'].includes(bId));
      } else if (camper.ageGroup === 'OCP') {
        requiredBlocks = this.blocksToAssign.filter(bId => ['A', 'B'].includes(bId));

        if (camper.level <= 3) {
          requiredBlocks.push(...this.blocksToAssign.filter(bId => ['C', 'D', 'E'].includes(bId)));
        } else {
          // Levels 4–5 → optional swimming

        }
      }

      requiredBlocks.forEach(blockId => {
        const block = this.schedule.blocks[blockId];
        if (!block) return;

        const waterfrontActivity = block.activities.find(act => act.name === 'Waterfront');
        waterfrontActivity?.assignments.camperIds.push(camper.id);
      });
    });
  }




  assignCampers() { return this; }

  assignStaff() { return this; }

  assignAdmins() { return this; }
}