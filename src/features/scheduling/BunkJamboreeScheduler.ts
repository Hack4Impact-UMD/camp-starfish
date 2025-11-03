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

  withStaff(staff: StaffAttendeeID[]): BunkJamboreeScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withCampers(campers: CamperAttendeeID[]): BunkJamboreeScheduler { this.campers = campers; return this; }

  withPreferences(preferences: SectionPreferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  assignPeriodsOff(): BunkJamboreeScheduler {
    const relationships = this.getYesYesRelationships();

    // All attendees
    const allAttendees = [
      ...this.staff.map(s => ({ id: s.id, role: 'STAFF' as const, bunk: s.bunk })),
      ...this.admins.map(a => ({ id: a.id, role: 'ADMIN' as const }))
    ];

    const assignedPeriodsOff = new Set<number>();

    // Ensure all blocks exist
    this.blocksToAssign.forEach(blockId => {
      if (!this.schedule.blocks[blockId]) {
        this.schedule.blocks[blockId] = { activities: [], periodsOff: [] };
      } else if (!this.schedule.blocks[blockId].periodsOff) {
        this.schedule.blocks[blockId].periodsOff = [];
      }
    });

    let adminIndex = 0;

    // Helper: check if a staff from the same bunk is already off
    const isStaffBunkOff = (staffBunk: number, blockId: string) => {
      const block = this.schedule.blocks[blockId];
      return block.periodsOff.some(offId => {
        const offStaff = this.staff.find(s => s.id === offId);
        return offStaff?.bunk === staffBunk;
      });
    };

    // Helper: check if enough admins remain for activities
    const canAdminTakeOff = (blockId: string) => {
      const block = this.schedule.blocks[blockId];
      const totalActivities = block.activities.length;
      const currentAdminsOff = block.periodsOff.filter(id => this.admins.some(a => a.id === id)).length;
      return this.admins.length - (currentAdminsOff + 1) >= totalActivities;
    };

    // Assign periods off
    while (assignedPeriodsOff.size < allAttendees.length) {
      const unassigned = allAttendees.filter(a => !assignedPeriodsOff.has(a.id));
      if (unassigned.length === 0) break;

      const attendee = unassigned[Math.floor(Math.random() * unassigned.length)];

      let eligibleBlocks: string[] = [];

      if (attendee.role === 'STAFF') {
        eligibleBlocks = this.blocksToAssign.filter(blockId => !isStaffBunkOff(attendee.bunk, blockId));
        if (eligibleBlocks.length === 0) {
          // If no eligible block, force assign to random block
          eligibleBlocks = [this.blocksToAssign[Math.floor(Math.random() * this.blocksToAssign.length)]];
        }
      } else {
        // Admin
        eligibleBlocks = this.blocksToAssign.filter(blockId => canAdminTakeOff(blockId));
        if (eligibleBlocks.length === 0) {
          // If no eligible block, force assign to random block
          eligibleBlocks = [this.blocksToAssign[Math.floor(Math.random() * this.blocksToAssign.length)]];
        }
      }

      let targetBlockId: string;
      if (attendee.role === 'ADMIN') {
        // Rotate admin periods off across blocks
        targetBlockId = eligibleBlocks[adminIndex % eligibleBlocks.length];
        adminIndex++;
      } else {
        // Staff: pick block with least staff already off
        targetBlockId = eligibleBlocks.reduce((minBlock, blockId) => {
          const count = this.schedule.blocks[blockId].periodsOff.filter(id => this.staff.some(s => s.id === id)).length;
          const minCount = this.schedule.blocks[minBlock].periodsOff.filter(id => this.staff.some(s => s.id === id)).length;
          return count < minCount ? blockId : minBlock;
        }, eligibleBlocks[0]);
      }

      // Assign period off
      this.schedule.blocks[targetBlockId].periodsOff.push(attendee.id);
      assignedPeriodsOff.add(attendee.id);

      // Optionally assign yes-yes related attendees if they don’t break rules
      const related = relationships.get(attendee.id) || [];
      for (const rel of related) {
        if (assignedPeriodsOff.has(rel.id)) continue;

        if (rel.role === 'STAFF') {
          const sameBunk = this.staff.find(s => s.id === rel.id)?.bunk;
          const conflict = isStaffBunkOff(sameBunk!, targetBlockId);
          if (!conflict) {
            this.schedule.blocks[targetBlockId].periodsOff.push(rel.id);
            assignedPeriodsOff.add(rel.id);
          }
        } else {
          if (canAdminTakeOff(targetBlockId)) {
            this.schedule.blocks[targetBlockId].periodsOff.push(rel.id);
            assignedPeriodsOff.add(rel.id);
          }
        }
      }
    }

    return this;
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