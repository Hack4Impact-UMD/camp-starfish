import { AdminAttendeeID, StaffAttendeeID, CamperAttendeeID, SectionSchedule, SectionPreferences, BunkID, Block, BlockPreferences, JamboreeActivity, BunkAssignments } from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";

export class BunkJamboreeScheduler {
  schedule: SectionSchedule<"BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  bunks: BunkID[] = [];
  admins: AdminAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  campers: CamperAttendeeID[] = [];
  
  preferences: SectionPreferences = {};

  blocksToAssign: string[] = [];

  constructor() { }

  withSchedule(schedule: SectionSchedule<"BUNK-JAMBO">): BunkJamboreeScheduler { this.schedule = schedule; return this; }

  withBunks(bunks: BunkID[]): BunkJamboreeScheduler { this.bunks = bunks; return this; }

  withAdmins(admins: AdminAttendeeID[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withCampers(campers: CamperAttendeeID[]): BunkJamboreeScheduler { this.campers = campers; return this; }

  withPreferences(preferences: SectionPreferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): BunkJamboreeScheduler {
    // Get all yesyes relationships
    const relationships = this.getYesYesRelationships();
    
    // Get all available staff and admin IDs
    const allAttendees = [
      ...this.staff.map(s => ({ id: s.id, role: 'STAFF' as const })),
      ...this.admins.map(a => ({ id: a.id, role: 'ADMIN' as const }))
    ];
    
    // Track who has been assigned periods off
    const assignedPeriodsOff = new Set<number>();
    
    // Initialize all blocks if they don't exist
    this.blocksToAssign.forEach(blockId => {
      if (!this.schedule.blocks[blockId]) {
        this.schedule.blocks[blockId] = { activities: [], periodsOff: [] };
      }
    });
    
    // Continue until all attendees have been assigned a period off
    while (assignedPeriodsOff.size < allAttendees.length) {
      // Get unassigned attendees
      const unassignedAttendees = allAttendees.filter(attendee => 
        !assignedPeriodsOff.has(attendee.id)
      );
      
      if (unassignedAttendees.length === 0) break;
      
      // Pick a random unassigned attendee
      const randomAttendee = unassignedAttendees[
        Math.floor(Math.random() * unassignedAttendees.length)
      ];
      
      // Find the block with the least staff members on break
      const blockWithLeastBreaks = this.findBlockWithLeastBreaks();
      
      // Assign the random attendee to this block
      this.schedule.blocks[blockWithLeastBreaks].periodsOff.push(randomAttendee.id);
      assignedPeriodsOff.add(randomAttendee.id);
      
      // Assign all people in yesyes relationship with this attendee to the same block
      const relatedPeople = relationships.get(randomAttendee.id) || [];
      relatedPeople.forEach(relatedPerson => {
        if (!assignedPeriodsOff.has(relatedPerson.id)) {
          this.schedule.blocks[blockWithLeastBreaks].periodsOff.push(relatedPerson.id);
          assignedPeriodsOff.add(relatedPerson.id);
        }
      });
    }
    
    return this;
  }

  /**
   * Finds the block with the least number of staff members currently on break
   */
  private findBlockWithLeastBreaks(): string {
    let minBreaks = Infinity;
    let blockWithMinBreaks = this.blocksToAssign[0];
    
    this.blocksToAssign.forEach(blockId => {
      const currentBreaks = this.schedule.blocks[blockId]?.periodsOff.length || 0;
      if (currentBreaks < minBreaks) {
        minBreaks = currentBreaks;
        blockWithMinBreaks = blockId;
      }
    });
    
    return blockWithMinBreaks;
  }

  assignAdminsToActivities(): BunkJamboreeScheduler {
    this.blocksToAssign.forEach(blockId => {
      const block = this.schedule.blocks[blockId];
      
      if (block) {
        this.assignAdminsToActivitiesHelper(block);
      }
    });
    
    return this;
  }

  private assignAdminsToActivitiesHelper(block: Block<"BUNK-JAMBO">): void {
    // Get all available admin IDs (excluding those on period off)
    const availableAdmins = this.admins
      .filter(admin => !block.periodsOff.includes(admin.id))
      .map(admin => admin.id);
    
    // Create a map to track how many admins are assigned to each activity
    const activityAdminCounts = new Map<string, number>();
    block.activities.forEach(activity => {
      activityAdminCounts.set(activity.name, activity.assignments.adminIds.length);
    });
    
    // Shuffle admins for fairness in assignment order
    const shuffledAdmins = [...availableAdmins].sort(() => Math.random() - 0.5);
    
    // Assign each admin to exactly one activity
    shuffledAdmins.forEach(adminId => {
      // Find the admin object to access nono list
      const admin = this.admins.find(a => a.id === adminId);
      if (!admin) return;
      
      // Find activities that don't have conflicts with this admin's nono list
      const compatibleActivities = block.activities.filter(activity => {
        // Get all camper IDs in bunks assigned to this activity
        const camperIdsInActivity = activity.assignments.bunk.flatMap(bunkId => {
          const bunk = this.bunks.find(b => b.id === bunkId);
          return bunk ? bunk.camperIds : [];
        });
        
        // Check if any campers in this activity are in the admin's nono list
        const hasConflict = admin.nonoList.some(nonoId => 
          camperIdsInActivity.includes(nonoId)
        );
        
        return !hasConflict;
      });
      
      // If no compatible activities, skip this admin (they'll remain unassigned)
      if (compatibleActivities.length === 0) {
        return;
      }
      
      // Find the minimum number of admins assigned to any compatible activity
      const minAdminCount = Math.min(
        ...compatibleActivities.map(activity => 
          activityAdminCounts.get(activity.name)!
        )
      );
      
      // Find all compatible activities with the minimum number of admins
      const activitiesWithMinAdmins = compatibleActivities.filter(activity => 
        activityAdminCounts.get(activity.name) === minAdminCount
      );
      
      // If there's only one activity with minimum admins, assign to it
      if (activitiesWithMinAdmins.length === 1) {
        const activity = activitiesWithMinAdmins[0];
        activity.assignments.adminIds.push(adminId);
        activityAdminCounts.set(activity.name, activityAdminCounts.get(activity.name)! + 1);
        return;
      }
      
      // Multiple activities with same minimum admin count - pick randomly
      const randomActivity = activitiesWithMinAdmins[
        Math.floor(Math.random() * activitiesWithMinAdmins.length)
      ];
      randomActivity.assignments.adminIds.push(adminId);
      activityAdminCounts.set(randomActivity.name, activityAdminCounts.get(randomActivity.name)! + 1);
    });
  }

  assignBunksToActivities(): BunkJamboreeScheduler {
    this.blocksToAssign.forEach(blockId => {
      const block = this.schedule.blocks[blockId];
      const blockPreferences = this.preferences[blockId];
      
      if (block && blockPreferences) {
        this.assignBunksToActivitiesHelper(block, blockPreferences);
      }
    });
    
    return this;
  }

  private assignBunksToActivitiesHelper(
    block: Block<"BUNK-JAMBO">, 
    preferences: BlockPreferences
  ): void {
    // Get all available bunk IDs
    const availableBunks = this.bunks.map(bunk => bunk.id);
    
    // Create a map to track how many bunks are assigned to each activity
    const activityBunkCounts = new Map<string, number>();
    block.activities.forEach(activity => {
      activityBunkCounts.set(activity.name, activity.assignments.bunk.length);
    });
    
    // Shuffle bunks for fairness in assignment order
    const shuffledBunks = [...availableBunks].sort(() => Math.random() - 0.5);
    
    // Assign each bunk to exactly one activity
    shuffledBunks.forEach(bunkId => {
      // Find the minimum number of bunks assigned to any activity
      const minBunkCount = Math.min(...Array.from(activityBunkCounts.values()));
      
      // Find all activities with the minimum number of bunks
      const activitiesWithMinBunks = block.activities.filter(activity => 
        activityBunkCounts.get(activity.name) === minBunkCount
      );
      
      // If there's only one activity with minimum bunks, assign to it
      if (activitiesWithMinBunks.length === 1) {
        const activity = activitiesWithMinBunks[0];
        activity.assignments.bunk.push(bunkId);
        activityBunkCounts.set(activity.name, activityBunkCounts.get(activity.name)! + 1);
        return;
      }
      
      // Multiple activities with minimum bunks - use preferences to break ties
      const activityPreferences = activitiesWithMinBunks.map(activity => ({
        activity,
        preference: preferences[bunkId]?.[activity.name] || 0
      }));
      
      // Find the maximum preference score
      const maxPreference = Math.max(...activityPreferences.map(ap => ap.preference));
      
      // Filter to activities with the maximum preference
      const activitiesWithMaxPreference = activityPreferences
        .filter(ap => ap.preference === maxPreference)
        .map(ap => ap.activity);
      
      // If there's only one activity with max preference, assign to it
      if (activitiesWithMaxPreference.length === 1) {
        const activity = activitiesWithMaxPreference[0];
        activity.assignments.bunk.push(bunkId);
        activityBunkCounts.set(activity.name, activityBunkCounts.get(activity.name)! + 1);
        return;
      }
      
      // Multiple activities with same max preference - pick randomly
      const randomActivity = activitiesWithMaxPreference[
        Math.floor(Math.random() * activitiesWithMaxPreference.length)
      ];
      randomActivity.assignments.bunk.push(bunkId);
      activityBunkCounts.set(randomActivity.name, activityBunkCounts.get(randomActivity.name)! + 1);
    });
  }

  /**
   * Gets all "yesyes" relationships between admins and staff members.
   * Returns a map where each key is an attendee ID and the value is a set of related attendee IDs
   * that they have positive relationships with, along with role information.
   */
  getYesYesRelationships(): Map<number, { id: number; role: 'STAFF' | 'ADMIN' }[]> {
    const relationships = new Map<number, { id: number; role: 'STAFF' | 'ADMIN' }[]>();
    
    // Process admin relationships
    this.admins.forEach(admin => {
      if (admin.yesyesList && admin.yesyesList.length > 0) {
        // Initialize the array for this admin if it doesn't exist
        if (!relationships.has(admin.id)) {
          relationships.set(admin.id, []);
        }
        
        // Add relationships to other admins
        admin.yesyesList.forEach(relatedId => {
          // Check if the related ID is an admin
          if (this.admins.some(a => a.id === relatedId)) {
            relationships.get(admin.id)!.push({ id: relatedId, role: 'ADMIN' });
            
            // Add bidirectional relationship
            if (!relationships.has(relatedId)) {
              relationships.set(relatedId, []);
            }
            relationships.get(relatedId)!.push({ id: admin.id, role: 'ADMIN' });
          }
          // Check if the related ID is a staff member
          else if (this.staff.some(s => s.id === relatedId)) {
            relationships.get(admin.id)!.push({ id: relatedId, role: 'STAFF' });
            
            // Add bidirectional relationship
            if (!relationships.has(relatedId)) {
              relationships.set(relatedId, []);
            }
            relationships.get(relatedId)!.push({ id: admin.id, role: 'ADMIN' });
          }
        });
      }
    });
    
    // Process staff relationships
    this.staff.forEach(staff => {
      if (staff.yesyesList && staff.yesyesList.length > 0) {
        // Initialize the array for this staff member if it doesn't exist
        if (!relationships.has(staff.id)) {
          relationships.set(staff.id, []);
        }
        
        // Add relationships to other staff members
        staff.yesyesList.forEach(relatedId => {
          // Check if the related ID is a staff member
          if (this.staff.some(s => s.id === relatedId)) {
            relationships.get(staff.id)!.push({ id: relatedId, role: 'STAFF' });
            
            // Add bidirectional relationship
            if (!relationships.has(relatedId)) {
              relationships.set(relatedId, []);
            }
            relationships.get(relatedId)!.push({ id: staff.id, role: 'STAFF' });
          }
          // Check if the related ID is an admin
          else if (this.admins.some(a => a.id === relatedId)) {
            relationships.get(staff.id)!.push({ id: relatedId, role: 'ADMIN' });
            
            // Add bidirectional relationship
            if (!relationships.has(relatedId)) {
              relationships.set(relatedId, []);
            }
            relationships.get(relatedId)!.push({ id: staff.id, role: 'STAFF' });
          }
        });
      }
    });
    
    return relationships;
  }  
}