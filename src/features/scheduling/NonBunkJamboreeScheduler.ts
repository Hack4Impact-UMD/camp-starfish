/* Campers are beenAssigned individually instead of by Bunk*/
import {
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  SectionSchedule,
  Preferences,
  JamboreeActivity,
  IndividualAssignments,
} from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";

export class NonBunkJamboreeScheduler {
  schedule: SectionSchedule<"NON-BUNK-JAMBO"> = { 
    blocks: {}, alternatePeriodsOff: {}
   };

  /* givens */
  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  camperPrefs: Preferences = {};

  blocksToAssign: string[] = [];

  //  relationships between staff and admin
  relationships = this.staffAdminRelationship();

  constructor() { }

  withSchedule(schedule: SectionSchedule<"NON-BUNK-JAMBO">): NonBunkJamboreeScheduler { 
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

  withCamperPrefs(camperPrefs: Preferences): NonBunkJamboreeScheduler { 
    this.camperPrefs = camperPrefs; 
    return this; 
  }

  forBlocks(blockIds: string[]): NonBunkJamboreeScheduler { 
    this.blocksToAssign = blockIds; 
    return this;
   }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): NonBunkJamboreeScheduler { 
    const assignedStaff = new Set<number>();
    const assignedAdmins = new Set<number>();
    // going through relationships between staff/admin
    for (const relationship of this.relationships) {
      assignedStaff.add(relationship.staffId);
      assignedAdmins.add(relationship.adminId);
    }
    // filtering through staff and admin that need an assignment
    const unassignedStaff = this.staff.filter(s => !assignedStaff.has(s.id));
    const unassignedAdmins = this.admins.filter(a => !assignedAdmins.has(a.id));
    
    // iterating through blocks of periods off
    let blockIndex = 0;
    
    // assigning periods off for those in relationships
    for (const relationship of this.relationships) {
      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      this.schedule.alternatePeriodsOff[blockId] = 
        [ ...(this.schedule.alternatePeriodsOff[blockId] || []), relationship.staffId, relationship.adminId];
      blockIndex++;
    }
    // unassigned staff assignment
    for (const staff of unassignedStaff) {
      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      this.schedule.alternatePeriodsOff[blockId] =
        [ ...(this.schedule.alternatePeriodsOff[blockId] || []), staff.id];
      blockIndex++;
    }
    //unassigned admin assignment
    for (const admin of unassignedAdmins) {
      const blockId = this.blocksToAssign[blockIndex % this.blocksToAssign.length];
      this.schedule.alternatePeriodsOff[blockId] = 
        [ ...(this.schedule.alternatePeriodsOff[blockId] || []), admin.id];
      blockIndex++;
    }
    return this;
   }

   //assigning campters to blocks based on preferences, not by bunk
  assignCampers(): NonBunkJamboreeScheduler { 
    this.withCamperPrefs(this.camperPrefs);
    // sort the campers preferences
    const campersWithPrefs = this.campers.map(camper => ({
      camper,
      preferences: this.camperPrefs[camper.id] || {}
    })).sort((a, b) => {
      const aMaxPref = Math.max(...Object.values(a.preferences), 0);
      const bMaxPref = Math.max(...Object.values(b.preferences), 0);
      return bMaxPref - aMaxPref;
    }); 
    // assigning campers based on their preferences
    for (const { camper, preferences } of campersWithPrefs) {
      // sorting preferences
      const sortedPrefs = Object.entries(preferences).sort(([, a], [, b]) => b - a);
      let beenAssigned = false; 
      // priotize assigning to preferred foundActivity
      for (const [activityName, priority] of sortedPrefs) {
        //skip if already assigned
        if (beenAssigned){
            break;
        }        
        // go through blocks and activities to assign potential one
        for (const blockId of this.blocksToAssign) {
          const currentBlock = this.schedule.blocks[blockId];
          const foundActivity = currentBlock.activities.find(a => a.name === activityName);
          //if the there is an open activity we assign camper to it
          if (foundActivity && this.canAssignCamperToActivity(camper, foundActivity)) {
            foundActivity.assignments.camperIds.push(camper.id);
            beenAssigned = true;
            break;
          }
        }
      }
      // if nothing has been assigned then we try to find block
      if (!beenAssigned) {
        for (const blockId of this.blocksToAssign) {
          const currentBlock = this.schedule.blocks[blockId];
          for (const foundActivity of currentBlock.activities) {
            if (this.canAssignCamperToActivity(camper, foundActivity)) {
              foundActivity.assignments.camperIds.push(camper.id);
              beenAssigned = true;
              break;
            }
          }
          if (beenAssigned){
            break;
          } 
        }
      }
    }
    return this;
   }

   /*assign conselors to their bunk*/ 
  assignCounselors(): NonBunkJamboreeScheduler {
    // assign staff
    for (const staff of this.staff) {      
      // random assignment, not based on bunk, find available block as long as requiremennts are met
      for (const blockId of this.blocksToAssign) {
        const currentBlock = this.schedule.blocks[blockId];
        // checking for staff conflicts or nono list with camper
        for (const foundActivity of currentBlock.activities) {
          const hasConflict = this.checkStaffNonoConflicts(staff, foundActivity.assignments.staffIds);
          if (!hasConflict) {
            //assign activity assignments
            foundActivity.assignments.staffIds.push(staff.id);
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
  private staffAdminRelationship(): Array<{staffId: number, adminId: number}> {
    const relationships: Array<{staffId: number, adminId: number}> = [];
    // iterating through the array of staff and admin to check if they are in the yes yes list (does that confirm a relationship?)
    for (const staff of this.staff) {
      for (const admin of this.admins) {
        if (staff.yesyesList?.includes(admin.id) && admin.yesyesList?.includes(staff.id)) {
          relationships.push({ staffId: staff.id, adminId: admin.id });
        }
      }
    }
    return relationships;
  }

  //getting random periods (so we can assign these to staff/admin)
  private getRandomAvailablePeriod(assignedPeriods: Set<string>): string | null {
    const availablePeriods = this.blocksToAssign.filter(blockId => !assignedPeriods.has(blockId));
    if (availablePeriods.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * availablePeriods.length);
    return availablePeriods[randomIndex];
  }

//checking if staff or admin is already assigned to a period off
  private isAssignedToPeriodOff(attendeeId: number): boolean {
    for (const period in this.schedule.alternatePeriodsOff) {
      if (this.schedule.alternatePeriodsOff[period].includes(attendeeId)) {
        return true;
      }
    }
    return false;
  }

  //checking nono conflicts amonng staff
  private checkStaffNonoConflicts(staff: StaffAttendeeID, assignedStaffIds: number[]): boolean {
    return assignedStaffIds.some(assignedId => staff.nonoList.includes(assignedId));
  }

  //checking if a camper can participate in an foundActivity 
  /* INCLUCDES:
  checking camper nono list to make sure they are not asssigned in the same current block
  checking staff nono list to make sure they are not assigned i the same current block */ 
  private canAssignCamperToActivity(camper: CamperAttendeeID, foundActivity: JamboreeActivity & { assignments: IndividualAssignments }): boolean {
    // check nono list conflicts with other campers
    if (doesConflictExist(camper, foundActivity.assignments.camperIds)) {
      return false;
    }
    // check nono list conflicts with staff
    if (doesConflictExist(camper, foundActivity.assignments.staffIds)) {
      return false;
    }
    return true;
  }

//HELPERS FOR IDENTIFYING SCEDULING CONFLICTS IN PERIODS OFF

  // check if staff is on a period off on specific block
  private isStaffOnPeriodOff(staffId: number, blockId: string): boolean {
    const blockIndex = this.blocksToAssign.indexOf(blockId) + 1; 
    const periodOffList = this.schedule.alternatePeriodsOff[blockIndex.toString()];
    return periodOffList && periodOffList.includes(staffId);
  }

  // check if admin is on period off for a specific block so we can assign them later
  private isAdminOnPeriodOff(adminId: number, blockId: string): boolean {
    const blockIndex = this.blocksToAssign.indexOf(blockId) + 1; 
    const periodOffList = this.schedule.alternatePeriodsOff[blockIndex.toString()];
    return periodOffList && periodOffList.includes(adminId);
  }

}
