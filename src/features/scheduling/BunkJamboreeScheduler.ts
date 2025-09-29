import { AdminAttendeeID, SectionSchedule, SectionPreferences, Bunk } from "@/types/sessionTypes";

export class BunkJamboreeScheduler {
  schedule: SectionSchedule<"BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  bunks: Bunk[] = [];
  admins: AdminAttendeeID[] = [];

  preferences: SectionPreferences = {};

  blocksToAssign: string[] = [];

  constructor() { }

  withSchedule(schedule: SectionSchedule<"BUNK-JAMBO">): BunkJamboreeScheduler { this.schedule = schedule; return this; }

  withBunks(bunks: Bunk[]): BunkJamboreeScheduler { this.bunks = bunks; return this; }

  withAdmins(admins: AdminAttendeeID[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withPreferences(preferences: SectionPreferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }

  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff(): BunkJamboreeScheduler {
    // Create an undirected relationship map
    const relationships = new Map<number, Set<number>>();
    
    // Build undirected relationship map from admin yesyesList
    this.admins.forEach(admin => {
      if (admin.yesyesList && admin.yesyesList.length > 0) {
        // Initialize the set for this admin if it doesn't exist
        if (!relationships.has(admin.id)) {
          relationships.set(admin.id, new Set());
        }
        
        // Add bidirectional relationships
        admin.yesyesList.forEach(relatedId => {
          // Only add if the related admin is also in our admin list
          if (this.admins.some(a => a.id === relatedId)) {
            // Add A -> B relationship
            relationships.get(admin.id)!.add(relatedId);
            
            // Add B -> A relationship (undirected)
            if (!relationships.has(relatedId)) {
              relationships.set(relatedId, new Set());
            }
            relationships.get(relatedId)!.add(admin.id);
          }
        });
      }
    });
    
    // Initialize all blocks
    this.blocksToAssign.forEach(blockId => {
      if (!this.schedule.blocks[blockId]) {
        this.schedule.blocks[blockId] = { activities: [], periodsOff: [] };
      }
    });
    
    const assignedPeriodsOff = new Set<number>();
    
    // Process each admin
    this.admins.forEach(admin => {
      // Skip if already assigned a period off
      if (assignedPeriodsOff.has(admin.id)) {
        return;
      }
      
      // Check if this admin has relationships
      const relatedIds = relationships.get(admin.id);
      
      if (relatedIds && relatedIds.size > 0) {
        // Get all related admins (including the current admin)
        const allRelatedAdmins = [admin.id, ...Array.from(relatedIds)];
        
        // Pick a random block for this group
        const randomBlockId = this.blocksToAssign[Math.floor(Math.random() * this.blocksToAssign.length)];
        const block = this.schedule.blocks[randomBlockId];
        
        // Add all related admins to the same random period off
        allRelatedAdmins.forEach(adminId => {
          if (!assignedPeriodsOff.has(adminId)) {
            block.periodsOff.push(adminId);
            assignedPeriodsOff.add(adminId);
          }
        });
      } else {
        // No relationships, pick a random block for individual period off
        const randomBlockId = this.blocksToAssign[Math.floor(Math.random() * this.blocksToAssign.length)];
        const block = this.schedule.blocks[randomBlockId];
        
        block.periodsOff.push(admin.id);
        assignedPeriodsOff.add(admin.id);
      }
    });
    
    return this;
  }

  assignAdminsToActivities(): BunkJamboreeScheduler { return this; }

  assignBunksToActivities(): BunkJamboreeScheduler { return this; }
}
