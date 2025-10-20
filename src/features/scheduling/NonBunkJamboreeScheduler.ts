/* Campers are been assigned individually instead of by bunk*/

/* TODO:
-check one-to-one assignment (from same bunk, staff/admin)
-fix style
-checking posts assignment
*/

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
  schedule: SectionSchedule<"NON-BUNK-JAMBO"> = { 
    blocks: {}, alternatePeriodsOff: {}
   };

  /* givens */
  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  camperPrefs: SectionPreferences = {};

  blocksToAssign: string[] = [];

  // relationships are derived when needed from the current rosters
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

  withCamperPrefs(camperPrefs: SectionPreferences): NonBunkJamboreeScheduler { 
    this.camperPrefs = camperPrefs; 
    return this; 
  }

  forBlocks(blockIds: string[]): NonBunkJamboreeScheduler { 
    this.blocksToAssign = blockIds; 
    return this;
   }

  // each staff member & admin must have 1 period off per day 
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
    // preferences are read from this.camperPrefs; no need to reassign here
    // Iterate per-block, then activities, assigning campers based on that block's preferences
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      if (!currentBlock) { continue; }

      const blockPrefs = this.camperPrefs[blockId] || {};

      // order campers by their max preference in this block (descending)
      const campersOrdered = [...this.campers].sort((a, b) => {
        const aPrefs = blockPrefs[a.id] || {};
        const bPrefs = blockPrefs[b.id] || {};
        const aMax = Object.values(aPrefs).length ? Math.max(...Object.values(aPrefs)) : 0;
        const bMax = Object.values(bPrefs).length ? Math.max(...Object.values(bPrefs)) : 0;
        return bMax - aMax;
      });

      const assignedThisBlock = new Set<number>();

      for (const camper of campersOrdered) {
        if (assignedThisBlock.has(camper.id)) { continue; }

        const camperPrefsForBlock = blockPrefs[camper.id] || {};
        // sort activities by this camper's preference for the block (descending)
        const activitiesByPref = [...currentBlock.activities].sort((a, b) => {
          const aScore = camperPrefsForBlock[a.name] ?? 0;
          const bScore = camperPrefsForBlock[b.name] ?? 0;
          return bScore - aScore;
        });

        let placed = false;

        // try preferred activities first for campers
        for (const foundActivity of activitiesByPref) {
          if (this.canAssignCamperToActivity(camper, foundActivity)) {
            foundActivity.assignments.camperIds.push(camper.id);
            assignedThisBlock.add(camper.id);
            placed = true;
            break;
          }
        }

        // else any activity without conflicts
        if (!placed) {
          for (const foundActivity of currentBlock.activities) {
            if (this.canAssignCamperToActivity(camper, foundActivity)) {
              foundActivity.assignments.camperIds.push(camper.id);
              assignedThisBlock.add(camper.id);
              break;
            }
          }
        }
      }
    }
    return this;
   }

   /*assign conselors to their bunk*/ 
  assignCounselors(): NonBunkJamboreeScheduler {
    const relationships = this.staffAdminRelationship();
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      if (!currentBlock) { continue; }
      // track which staff have already been placed in this block to avoid double-assignments
      const assignedThisBlock = new Set<number>();
      for (const activity of currentBlock.activities) {
        for (const sid of activity.assignments.staffIds) { assignedThisBlock.add(sid); }
      }

      // esure near 1:1 by filling remaining needs per activity, only on activities with campers
      const relationshipsByStaff = new Map<number, number>();
      for (const r of relationships) { relationshipsByStaff.set(r.staffId, r.adminId); }
      const availableStaff = this.staff.filter(s => !this.isStaffOnPeriodOff(s.id, blockId));
      for (const activity of currentBlock.activities) {
        const campers = activity.assignments.camperIds.length;
        if (campers === 0) { continue; }
        let have = activity.assignments.staffIds.length;
        let need = Math.max(0, campers - have);
        while (need > 0) {
          let placed = false;
          for (const staff of availableStaff) {
            if (assignedThisBlock.has(staff.id)) { continue; }
            // avoid staff-staff nono conflicts within the activity
            if (this.checkStaffNonoConflicts(staff, activity.assignments.staffIds)) { continue; }
            // avoid placing with relationship admin
            const relAdmin = relationshipsByStaff.get(staff.id);
            if (relAdmin && activity.assignments.adminIds.includes(relAdmin)) { continue; }
            activity.assignments.staffIds.push(staff.id);
            assignedThisBlock.add(staff.id);
            have++;
            need--;
            placed = true;
            break;
          }
          if (!placed) { break; }
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
    const periodOffList = this.schedule.alternatePeriodsOff[blockId];  
    return !!periodOffList && periodOffList.includes(staffId);  
  }  

  // check if admin is on period off for a specific block so we can assign them later  
  private isAdminOnPeriodOff(adminId: number, blockId: string): boolean {  
    const periodOffList = this.schedule.alternatePeriodsOff[blockId];  
    return !!periodOffList && periodOffList.includes(adminId);  
  }  

  //asigning admins to activity blocks
  assignAdmins(): NonBunkJamboreeScheduler {
    const relationships = this.staffAdminRelationship();
    for (const blockId of this.blocksToAssign) {
      const currentBlock = this.schedule.blocks[blockId];
      if (!currentBlock) { continue; }
      const availableAdmins = this.admins.filter(a => !this.isAdminOnPeriodOff(a.id, blockId));
      for (const activity of currentBlock.activities) {
        if (activity.assignments.adminIds.length > 0) { continue; }
        let chosen: number | undefined;
        for (const admin of availableAdmins) {
          let ok = true;
          for (const sid of activity.assignments.staffIds) {
            const isRel = relationships.some(r => r.staffId === sid && r.adminId === admin.id);
            if (isRel) { ok = false; break; }
          }
          if (!ok) { continue; }
          chosen = admin.id;
          break;
        }
        if (chosen === undefined && availableAdmins.length > 0) {
          chosen = availableAdmins[0].id;
        }
        if (chosen !== undefined) {
          activity.assignments.adminIds.push(chosen);
        }
      }
    }
    return this;
  }
}