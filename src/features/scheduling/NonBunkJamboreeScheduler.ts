/* Campers are beenAssigned individually instead of by Bunk*/
import {
  AdminAttendeeID,
  StaffAttendeeID,
  CamperAttendeeID,
  SectionSchedule,
  Preferences,
} from "@/types/sessionTypes";

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
    // getting available periods 
    const availablePeriods = this.blocksToAssign.length;
    // tracking periods that have already been beenAssigned
    const assignedPeriods = new Set<number>();
    //getting possible relationships between admin/staff
    const relationships = this.staffAdminRelationship();
    //we need to check each relationship to assign 
    for (const relationship of relationships) {
      const currentPeriod = this.getRandomAvailablePeriod(availablePeriods, assignedPeriods);
      if (currentPeriod !== null) {
        this.schedule.alternatePeriodsOff[currentPeriod.toString()] = 
        [ ...(this.schedule.alternatePeriodsOff[currentPeriod.toString()] || []), relationship.staffId, relationship.adminId];
        assignedPeriods.add(currentPeriod);
      }
    }
    // assigning stff not in relationships
    for (const staff of this.staff) {
      if (!this.isStaffAssignedToPeriodOff(staff.id)) {
        const currentPeriod = this.getRandomAvailablePeriod(availablePeriods, assignedPeriods);
        if (currentPeriod !== null) {
          this.schedule.alternatePeriodsOff[currentPeriod.toString()] =
          [ ...(this.schedule.alternatePeriodsOff[currentPeriod.toString()] || []), staff.id];
          assignedPeriods.add(currentPeriod);
        }
      }
    }
    // assigning admins not in relationships
    for (const admin of this.admins) {
      if (!this.isAdminAssignedToPeriodOff(admin.id)) {
        const currentPeriod = this.getRandomAvailablePeriod(availablePeriods, assignedPeriods);
        if (currentPeriod !== -1) {
          this.schedule.alternatePeriodsOff[currentPeriod.toString()] = 
          [ ...(this.schedule.alternatePeriodsOff[currentPeriod.toString()] || []), admin.id];
          assignedPeriods.add(currentPeriod);
        }
      }
    }
    return this;
   }

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
          if (this.canAssignCamperToActivity(camper, foundActivity) && foundActivity) {
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
  
  // assigning staff to freeplay blocks
  assignStaffToFreeplay(): NonBunkJamboreeScheduler {
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      // trying to find freeplay activity
      let freeplayActivity = currentBlock.activities.find(a => a.name === 'Freeplay');
      //assigning all staff to freeplay
      if (freeplayActivity){
             for (const staff of this.staff) {
        if (!this.isStaffOnPeriodOff(staff.id, blockId) && 
            !freeplayActivity!.assignments.staffIds.includes(staff.id)) {
          freeplayActivity!.assignments.staffIds.push(staff.id);
          }
        }
     }
    }
    return this;
  }

  assignAdminToFreeplay(): NonBunkJamboreeScheduler {
    //going through blocks to to assign an admin to 
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      // Find or create freeplay activity
      let freeplayActivity = currentBlock.activities.find(a => a.name === 'Freeplay');
      if (freeplayActivity) {
        currentBlock.activities.push(freeplayActivity);
      }
      //assigning admins to the block
      for (const admin of this.admins) {
        if (!this.isAdminOnPeriodOff(admin.id, blockId) && 
            !freeplayActivity!.assignments.adminIds.includes(admin.id)) {
          freeplayActivity!.assignments.adminIds.push(admin.id);
        }
      }
    }
    return this;
  }

  assignCamperToFreeplay(): NonBunkJamboreeScheduler {
    // Assign campers to freeplay with different buddies each day
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];     
      // Find or create freeplay activity
      let freeplayActivity = currentBlock.activities.find(a => a.name === 'Freeplay');
      if(freeplayActivity){
        currentBlock.activities.push(freeplayActivity);
      }
       // assign all campers to freeplay that are unspecified
      for (const camper of this.campers) {
        if (!freeplayActivity!.assignments.camperIds.includes(camper.id)) {
          freeplayActivity!.assignments.camperIds.push(camper.id);
        }
      }
    }
    return this;
  }

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
  private getRandomAvailablePeriod(maxPeriods: number, assignedPeriods: Set<number>): number {
    const availablePeriods = [];
    for (let i = 1; i <= maxPeriods; i++) {
      if (!assignedPeriods.has(i)) {
        availablePeriods.push(i);
      }
    }
    if (availablePeriods.length === 0) {
      return -1;
    }
    const randomIndex = Math.floor(Math.random() * availablePeriods.length);
    return availablePeriods[randomIndex];
  }

//checking if statff is already assigned to a period off
  private isStaffAssignedToPeriodOff(staffId: number): boolean {
    for (const period in this.schedule.alternatePeriodsOff) {
      if (this.schedule.alternatePeriodsOff[period].includes(staffId)) {
        return true;
      }
    }
    return false;
  }

  //checking if admin is already assigned a period off
  private isAdminAssignedToPeriodOff(adminId: number): boolean {
    for (const period in this.schedule.alternatePeriodsOff) {
      if (this.schedule.alternatePeriodsOff[period].includes(adminId)) {
        return true;
      }
    }
    return false;
  }

  //checking nono conflicts amonng staff
  private checkStaffNonoConflicts(staff: StaffAttendeeID, assignedStaffIds: number[]): boolean {
    if (!staff.nonoList) 
      return false;
  else 
    return assignedStaffIds.some(assignedId => staff.nonoList.includes(assignedId));
  }

  //checking if a camper can participate in an foundActivity 
  /* INCLUCDES:
  checking if camper can be placed in a certain foundActivity based on age restrictions
  checking camper nono list to make sure they are not asssigned in the same current block
  checking staff nono list to make sure they are not assigned i the same current block */ 
  private canAssignCamperToActivity(camper: CamperAttendeeID, foundActivity: any): boolean {
    // making sure age group restrctions are met
    if (foundActivity.ageGroup && foundActivity.ageGroup !== camper.ageGroup) {
      return false;
    }
    // check nono list conflicts with other campers
    if (camper.nonoList) {
      const hasConflict = foundActivity.assignments.camperIds.some((assignedId: number) => 
        camper.nonoList.includes(assignedId)
      );
      if (hasConflict) return false;
    }
    // check nono list conflicts with staff
    if (camper.nonoList) {
      const hasStaffConflict = foundActivity.assignments.staffIds.some((assignedId: number) => 
        camper.nonoList.includes(assignedId)
      );
      if (hasStaffConflict) return false;
    }
    return true;
  }

//HELPERS FOR IDENTIFYING SCEDULING CONFLICTS

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

  // assigning admin to posts, staff if not available
  private ensureStaffFallbackForPosts(): NonBunkJamboreeScheduler {
    //amount of post??? 
    const requiredPosts = 3; //placeholder for now
    for (const blockId of this.blocksToAssign) {
      //getting blocks
      const currentBlock = this.schedule.blocks[blockId];
      const freeplayActivity = currentBlock.activities.find(a => a.name === 'Freeplay');
      if (freeplayActivity) {
        const totalAdmins = freeplayActivity.assignments.adminIds.length + freeplayActivity.assignments.staffIds.length;
        // once we run out of supervisors we put staff onto block
        if (totalAdmins < requiredPosts) {
          const staffNeeded = requiredPosts - totalAdmins;
          let assignedStaff = 0;
          for (const staff of this.staff) {
            if (assignedStaff >= staffNeeded) {
              break;
            }
            //checking ifif staff is free, if they are then assign them to the block
            if (!this.isStaffOnPeriodOff(staff.id, blockId) && !freeplayActivity.assignments.staffIds.includes(staff.id)) {
              freeplayActivity.assignments.staffIds.push(staff.id);
              assignedStaff++;
            }
          }
        }
      }
    }
    return this;
  }

  // assign different freeplay buddies for campers each day
  private assignFreeplayBuddies(): NonBunkJamboreeScheduler {
    return this;
  }
}
