import { AdminAttendeeID, StaffAttendeeID, CamperAttendeeID, SectionSchedule, SectionPreferences, BunkID, Block, BlockPreferences, JamboreeActivity, BunkAssignments, SchedulingSectionID } from "@/types/sessionTypes";
import { doesConflictExist } from "./schedulingUtils";

export class BunkJamboreeScheduler {
  schedule: SectionSchedule<"BUNK-JAMBO"> = { blocks: {}, alternatePeriodsOff: {} };

  bunks: BunkID[] = [];
  admins: AdminAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  campers: CamperAttendeeID[] = [];
  
  preferences: SectionPreferences = {};

  blocksToAssign: string[] = [];


  sectionID: SchedulingSectionID = {
    id: "",
    name: `Bunk Jamboree`,
    type: "BUNK-JAMBO",
    startDate: "",          // ISO-8601 string (e.g. "2026-01-05")
    endDate: "",            // ISO-8601 string
    numBlocks: 0,
    isPublished: false,
    sessionId: ""
  };

  constructor() { }

  withSchedule(schedule: SectionSchedule<"BUNK-JAMBO">): BunkJamboreeScheduler { this.schedule = schedule; return this; }

  withBunks(bunks: BunkID[]): BunkJamboreeScheduler { this.bunks = bunks; return this; }

  withStaff(staff: StaffAttendeeID[]): BunkJamboreeScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): BunkJamboreeScheduler { this.admins = admins; return this; }

  withCampers(campers: CamperAttendeeID[]): BunkJamboreeScheduler { this.campers = campers; return this; }

  withPreferences(preferences: SectionPreferences): BunkJamboreeScheduler { this.preferences = preferences; return this; }

  withSectionID(sectionID: SchedulingSectionID): BunkJamboreeScheduler { this.sectionID = sectionID; return this; }

  forBlocks(blockIds: string[]): BunkJamboreeScheduler { this.blocksToAssign = blockIds; return this; }



  /* Each staff member & admin must have 1 period off per day */
  assignPeriodsOff() {

    // Filter out all staff/admin that have the day OFF 
    const eligibleStaff = this.staff.filter(s => !s.daysOff.includes(this.sectionID.id));
    const eligibleAdmins = this.admins.filter(a => !a.daysOff.includes(this.sectionID.id));
    const allStaffAndAdmins = [...eligibleStaff, ...eligibleAdmins];

    let ogMapDiff = new Map<number, number>();
    let mapDiff = new Map<number, number>();

    for (const bunk of this.bunks) {

      let totalStaff = 0
      for (const staff of bunk.staffIds) {

        if (eligibleStaff.some(s => s.id === staff)) {
          totalStaff += 1
        }
      }

      ogMapDiff.set(bunk.id, bunk.camperIds.length - totalStaff)
    }

    const notAssigned = new Set<StaffAttendeeID | AdminAttendeeID>(allStaffAndAdmins);

    const TOTAL_POSSIBLE_REST_BLOCKS =
      this.blocksToAssign.length + Object.keys(this.schedule.alternatePeriodsOff).length;

    const MAX_CAPACITY = allStaffAndAdmins.length / TOTAL_POSSIBLE_REST_BLOCKS;
    console.log(allStaffAndAdmins.length);

    // Fill blocks first before moving onto alternate periods off
    for (const blockId of this.blocksToAssign) {
      if (!this.schedule.blocks[blockId]) throw new Error("Invalid block");


      mapDiff = new Map(ogMapDiff);
      const block = this.schedule.blocks[blockId];
      const activities = block.activities;

      const isBusy = (id: number) =>
        activities.some(
          act =>
            act.assignments.adminIds.includes(id)
        );

      // Alternate preference per successful assignment
      let pickAdminNext = true;

      const tryAssignPerson = (person: StaffAttendeeID | AdminAttendeeID) => {
        if (!notAssigned.has(person)) return false;
        if (isBusy(person.id)) return false;

        if ('bunk' in person && mapDiff) {
          const diff = mapDiff.get(person.bunk) ?? 100; // default to 0 if undefined
          if (diff + 1 > 2) {
            return false
          }
        }

        // Assigns the staff/admin member to the block for period off
        block.periodsOff.push(person.id);
        notAssigned.delete(person);
        if ('bunk' in person && mapDiff) 
        {
          const diff = mapDiff.get(person.bunk) ?? 100;
          mapDiff.set(person.bunk, diff + 1);
        }

        // If there is still space in the block for periods off, then assign a yesyes
        if (block.periodsOff.length < MAX_CAPACITY) {
          // Filters out yesyesList that are already assigned to an activity or have a day off
          let filteredYesyesList = person.yesyesList
            .filter((id: number) => allStaffAndAdmins.some(p => p.id === id));
          filteredYesyesList = filteredYesyesList
            .filter((id: number) => !isBusy(id));

          // Assigns the yesyes to the block
          for (const yesyes of filteredYesyesList) {
            if (block.periodsOff.length >= MAX_CAPACITY) break;

            const yesyesPerson = allStaffAndAdmins.find(p => p.id === yesyes);
            if (!yesyesPerson) continue;

            if (!notAssigned.has(yesyesPerson)) continue;
            if ('bunk' in yesyesPerson && mapDiff) {
              const diff = mapDiff.get(yesyesPerson.bunk) ?? 100; // default to 0 if undefined
              if (diff + 1 > 2) {
                continue
              }
            }


            block.periodsOff.push(yesyes);
            notAssigned.delete(yesyesPerson);
            if ('bunk' in yesyesPerson && mapDiff) 
            {
              const diff = mapDiff.get(yesyesPerson.bunk) ?? 100;
              mapDiff.set(yesyesPerson.bunk, diff + 1);
            }
            break; // only assign one yesyes
          }
        }

        return true;
      };

      // Fill block up to capacity, alternating staff/admin
      while (block.periodsOff.length < MAX_CAPACITY && notAssigned.size > 0) {
        const primary = pickAdminNext ? eligibleAdmins : eligibleStaff;
        const secondary = pickAdminNext ? eligibleStaff : eligibleAdmins;

        let assigned = false;

        // Try primary group first
        for (const person of primary) {
          if (tryAssignPerson(person)) {
            assigned = true;
            pickAdminNext = !pickAdminNext; // flip ONLY after success
            break;
          }
        }

        // If none found, try the other group
        if (!assigned) {
          for (const person of secondary) {
            if (tryAssignPerson(person)) {
              assigned = true;
              pickAdminNext = !pickAdminNext;
              break;
            }
          }
        }

        // Prevent infinite loop if nobody eligible can be assigned
        if (!assigned) break;
      }
    }

    // Assign alternate periods off
    const remainingRestBlocks = TOTAL_POSSIBLE_REST_BLOCKS - this.blocksToAssign.length;

    if (remainingRestBlocks <= 0) return;

    const MAX_CAPACITY_APOS = notAssigned.size / remainingRestBlocks;

    // The remaining people in notAssigned are distributed among the APOS
    while (notAssigned.size > 0) {
      for (const apo of Object.keys(this.schedule.alternatePeriodsOff)) {
        while (
          this.schedule.alternatePeriodsOff[apo].length < MAX_CAPACITY_APOS &&
          notAssigned.size > 0
        ) {
          const iter = notAssigned.values().next();
          if (iter.done) break;

          const next = iter.value;
          this.schedule.alternatePeriodsOff[apo].push(next.id);
          notAssigned.delete(next);
        }
      }
    }
  }







  //assigning admins to activity blocks
  assignAdmin(){


    for (const blockID of this.blocksToAssign) {

      if (!this.schedule.blocks[blockID]) throw new Error("Invalid block");

      const activities = this.schedule.blocks[blockID].activities;
      if (!activities || activities.length === 0) throw new Error("Block has no activities");
      
      // Build array of available admins
      const availableAdmins = this.admins.filter(
        admin => !this.schedule.blocks[blockID].periodsOff.includes(admin.id) && 
        !admin.daysOff.includes(this.sectionID.id) &&
        !activities.some(activity => activity.assignments.adminIds.includes(admin.id))
      );      


      // Shuffle admins
      for (let i = availableAdmins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableAdmins[i], availableAdmins[j]] = [availableAdmins[j], availableAdmins[i]];
      }

      // Assign admins to activities, avoiding conflicts and balancing distribution

      const unassignedAdmin: AdminAttendeeID[] = [];

      const MAX_CAPACITY_ADMINS = Math.floor(availableAdmins.length/activities.length);
      for (const admin of availableAdmins) {
        const activity = activities.find((a) => {
          // Check max capacity for admins
          if (a.assignments.adminIds.length >= MAX_CAPACITY_ADMINS) return false;

          // Check for conflicts with campers, staff, or other admins
          for (const bunk of a.assignments.bunkNums) {

            const bunkId = this.bunks.find(b => b.id === bunk);

            if (!bunkId) continue;

            for (const camper of bunkId.camperIds) {
              if (doesConflictExist(admin, [camper])) return false;
            }

            for (const staffer of bunkId.staffIds) {
              if (doesConflictExist(admin, [staffer])) return false;
            }

            for (const otherAdmin of a.assignments.adminIds) {
              if (doesConflictExist(admin, [otherAdmin])) return false;
            }

          }

          // All checks passed
          return true;
        });

        if (activity) {
          activity.assignments.adminIds.push(admin.id);
        } else {
          unassignedAdmin.push(admin);
        }
      }


      const stillUnassigned = new Set<number>(unassignedAdmin.map(a => a.id));

      // One pass to assign the rest of admins to activities that have the lowest number of admins

      for (const admin of stillUnassigned) {
        activities.sort((a, b) => a.assignments.adminIds.length - b.assignments.adminIds.length);

        const actualAdmin = this.admins.find(a => a.id === admin);

        if (!actualAdmin) continue;

        const activity = activities.find((a) => {

          // Check for conflicts with campers, staff, or other admins
          for (const bunk of a.assignments.bunkNums) {

            const bunkId = this.bunks.find(b => b.id === bunk);

            if (!bunkId) continue;

            for (const camper of bunkId.camperIds) {
              if (doesConflictExist(actualAdmin, [camper])) return false;
            }

            for (const staffer of bunkId.staffIds) {
              if (doesConflictExist(actualAdmin, [staffer])) return false;
            }

            for (const otherAdmin of a.assignments.adminIds) {
              if (doesConflictExist(actualAdmin, [otherAdmin])) return false;
            }

          }

          // All checks passed
          return true;
        });

        if (activity) {
          activity.assignments.adminIds.push(actualAdmin.id);
          stillUnassigned.delete(actualAdmin.id);
        }

      }
      
      if (stillUnassigned.size > 0) console.warn(blockID, "Unassigned admins: ", stillUnassigned);


      // Check if there's at least one admin assigned to each activity
      const missingAdmins = this.schedule.blocks[blockID].activities.some((activity) => activity.assignments.adminIds.length === 0);
      if (missingAdmins) console.warn(blockID, "No admin assigned to activity");  
      
    }



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
      activityBunkCounts.set(activity.name, activity.assignments.bunkNums.length);
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
        activity.assignments.bunkNums.push(bunkId);
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
        activity.assignments.bunkNums.push(bunkId);
        activityBunkCounts.set(activity.name, activityBunkCounts.get(activity.name)! + 1);
        return;
      }
      
      // Multiple activities with same max preference - pick randomly
      const randomActivity = activitiesWithMaxPreference[
        Math.floor(Math.random() * activitiesWithMaxPreference.length)
      ];
      randomActivity.assignments.bunkNums.push(bunkId);
      activityBunkCounts.set(randomActivity.name, activityBunkCounts.get(randomActivity.name)! + 1);
    });
  }

}