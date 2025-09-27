import { StaffAttendeeID, CamperAttendeeID, AdminAttendeeID, SectionSchedule, Preferences, ProgramArea } from "@/types/sessionTypes";

export class BundleScheduler {
  bundleNum: number = -1;
  schedule: SectionSchedule<'BUNDLE'> = { blocks: {}, alternatePeriodsOff: {} };

  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  camperPrefs: Preferences = {};

  blocksToAssign: string[] = [];

  constructor() { }

  withBundleNum(bundleNum: number): BundleScheduler { this.bundleNum = bundleNum; return this; }

  withSchedule(schedule: SectionSchedule<'BUNDLE'>): BundleScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendeeID[]): BundleScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendeeID[]): BundleScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): BundleScheduler { this.admins = admins; return this; }

  withCampersPrefs(campersPrefs: Preferences): BundleScheduler { this.camperPrefs = campersPrefs; return this; }

  forBlocks(blockIds: string[]): BundleScheduler { this.blocksToAssign = blockIds; return this; }

  /*
    Each `programArea` needs a staff member (`StaffAttendeeID`) to be in charge.
    This function assigns the given programArea to the corresponding staff member.
  */
  assignProgramAreaCounselor(programArea: ProgramArea, staffID: StaffAttendeeID): void {
    staffID.programCounselor = programArea;
  }

  /* Each staff member and admin needs to have 1 period off per day */
  assignPeriodsOff() { return this; }

  /*
    Assign a camper (CamperAttendeeID) to the "Teen Chat" activity in the given block.
    Also update the block's`IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignOCPChats<T extends 'BUNDLE'>(camperID: CamperAttendeeID): void {
    if (camperID.ageGroup !== 'OCP') return;

    const prefs = this.camperPrefs[camperID.id];
    let blockId: string | undefined;

    if (prefs) {
      blockId = Object.keys(prefs).find(bId =>
        this.schedule.blocks[bId]?.activities.some(act => act.name === 'Teen Chat')
      );
    }

    if (!blockId) {
      blockId = this.blocksToAssign.find(bId =>
        this.schedule.blocks[bId].activities.some(act => act.name === 'Teen Chat')
      );
    }

    if (blockId) {
      const block = this.schedule.blocks[blockId];
      const teenChatActivity = block.activities.find(act => act.name === 'Teen Chat');
      teenChatActivity?.assignments.camperIds.push(camperID.id);
    }
  }


  /*
    Assign campers (CamperAttendeeID[]) to the "Waterfront" activity in the given block. 
    Also update the block's `IndividualAssignments` in the 'activities` field for the
    given block. Refer back to the scheduling data to see where each camper should be placed
  */
  assignSwimmingBlock<T extends 'BUNDLE'>(camperAttendees: CamperAttendeeID[]): void {
    camperAttendees.forEach(camper => {
      const prefs = this.camperPrefs[camper.id];
      let blockId: string | undefined;

      if (prefs) {
        blockId = Object.keys(prefs).find(bId =>
          this.schedule.blocks[bId]?.activities.some(act => act.name === 'Waterfront')
        );
      }

      if (!blockId) {
        blockId = this.blocksToAssign.find(bId =>
          this.schedule.blocks[bId].activities.some(act => act.name === 'Waterfront')
        );
      }

      if (blockId) {
        const block = this.schedule.blocks[blockId];
        const waterfrontActivity = block.activities.find(act => act.name === 'Waterfront');
        waterfrontActivity?.assignments.camperIds.push(camper.id);
      }
    });
  }


  assignCampers() { return this; }

  assignStaff() { return this; }

  assignAdmins() { return this; }
}