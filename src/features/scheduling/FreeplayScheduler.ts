import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, Freeplay, PostID } from "../../types/sessionTypes";

export class FreeplayScheduler {
  /* The current freeplay schedule */
  schedule: Freeplay = { posts: {}, buddies: {} };

  /* The session attendees that still need to be assigned */
  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  assignedCampers: CamperAttendeeID[] = [];
  assignedStaff: StaffAttendeeID[] = [];
  assignedAdmin: AdminAttendeeID[] = [];

  posts: PostID[] = [];

  /* The freeplay buddies from other freeplays in this session */
  otherFreeplayBuddies: { [attendeeId: number]: number[] } = {};

  // postInfo includes a list of all posts with PostID information (necessary for requiresAdmin flag) --> schedule only includes string of IDs
  constructor(schedule: Freeplay, postInfo: PostID[], campers: CamperAttendeeID[], staff: StaffAttendeeID[], admins: AdminAttendeeID[]) {
    this.withSchedule(schedule);
    this.withCampers(campers);
    this.withStaff(staff);
    this.withAdmins(admins);

    // NECESSARY FOR POST ASSIGNMENT
    this.posts = postInfo;
  }

  withSchedule(schedule: Freeplay): FreeplayScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendeeID[]): FreeplayScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendeeID[]): FreeplayScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): FreeplayScheduler { this.admins = admins; return this; }

  getCamperById = (id: number) => this.campers.find(c => c.id === id);

  getPostByID = (id: string) => this.posts.find(p => p.name === id);

  // withOtherFreeplays should build the previousFreeplayBuddies object
  withOtherFreeplays(otherFreeplays: Freeplay[]): FreeplayScheduler {
    for (const freeplay of otherFreeplays) {
      for (const buddieID in freeplay.buddies) {
        if (buddieID in this.otherFreeplayBuddies) {

          const attendees = freeplay.buddies[buddieID];

          // add all attendees that don't already exist
          for (const att of attendees) {
            if (!this.otherFreeplayBuddies[buddieID].includes(att)) {
              this.otherFreeplayBuddies[buddieID].push(att);
            }
          }
        } else {
          const attendees = freeplay.buddies[buddieID];
          this.otherFreeplayBuddies[buddieID] = attendees;
        }
      }
    }

    return this;
  }

  /* Assigns ADMINs to all posts that require ADMINs and either STAFF or ADMINs to all other posts */
  assignPosts() {

    // Keep track of available staff/admins
    const availableAdmins = [...this.admins];
    const availableStaff = [...this.staff];

    // assign all ADMIN-only roles first
    for (const postID in this.schedule.posts) {
      const assigned = this.schedule.posts[postID];
      const post = this.getPostByID(postID);
      if (assigned.length == 0 && post?.requiresAdmin) {
        if (availableAdmins.length > 0) {
          const adminID: AdminAttendeeID = availableAdmins.shift()!;
          this.schedule.posts[postID] = [adminID.id];
        }
      }
    }

    // assigns all other roles (not Admin-specific) to admins first, then staff
    for (const postID in this.schedule.posts) {
      const assigned = this.schedule.posts[postID];
      if (assigned.length == 0) {
        if (availableAdmins.length > 0) {
          const adminID: AdminAttendeeID = availableAdmins.shift()!;
          this.schedule.posts[postID] = [adminID.id];
          this.assignedAdmin.push(adminID);
        } else if (availableStaff.length > 0) {
          const staffID: StaffAttendeeID = availableStaff.shift()!;
          this.schedule.posts[postID] = [staffID.id];
          this.assignedStaff.push(staffID);
        }
      }
    }

    this.admins = [...availableAdmins];
    this.staff = [...availableStaff]

    return this;
  }


  /*
    Assigns campers to remaining ADMIN & STAFF members for freeplay according to the following rules:
    - Assign all female campers to female staff members first.
    - If there are not enough female staff members, assign multiple (MAX 2) campers of the same bunk
      to the same female staff member.
    - Assign all male campers to the remaining staff members.
    - If there are not enough staff members, assign multiple (MAX 2) campers of the same bunk
      to the same staff member.
    - Prioritize avoiding assigning the same "freeplay buddy" (previous buddy) if possible.
 */
    assignCampers() {
      // 1. Assign Admins to posts (use staff if not enough admins)
      this.assignPosts();
      const allAssignedStaffers = [...this.assignedAdmin, ...this.assignedStaff];

      // 2. Split campers by gender
      const femaleCampers = this.campers.filter(c => c.gender === "Female");
      const maleCampers = this.campers.filter(c => c.gender === "Male");

      // 3. Assign female campers
      for (const camper of femaleCampers) {
        let assigned = false;

        // Loop through female staffers/admins first
        for (const staffer of allAssignedStaffers) {

          if (staffer.gender !== "Female") continue;

          const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
          const prevBuddies = this.otherFreeplayBuddies[staffer.id] || [];

          // Check buddy conflict (camper.id appears in staffer's prevBuddies)
          const hasConflict = prevBuddies.includes(camper.id);

          if (!hasConflict && alreadyAssigned.length == 0) {
            if (staffer.role === "STAFF") {
              if (staffer.bunk !== camper.bunk) {
                assigned = true;
                this.schedule.buddies[staffer.id] = [camper.id];
              }
            } else {
              assigned = true;
              this.schedule.buddies[staffer.id] = [camper.id];
            }
          }
        }
      
        // Fallback: assign to any female staffer with < 2 campers
        if (!assigned) {
          for (const staffer of allAssignedStaffers) {
            if (staffer.gender !== "Female") continue;
      
            const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
            if (alreadyAssigned.length < 2) {
              if (alreadyAssigned.length == 0) {

                // edge case:
                  // if the camper hasn't been assigned already, there is a chance that it could be assigned...
                  // ... to an admin/staffer they have been with, or have the same bunk with here

                this.schedule.buddies[staffer.id] = [camper.id];
                assigned = true;
                break;

              } else {
                const otherCamper = this.getCamperById(alreadyAssigned[0]) || camper;
                if (otherCamper.bunk == camper.bunk) {
                  this.schedule.buddies[staffer.id].push(camper.id);
                  assigned = true;
                  break;
                }
              }
            }
          }
        }

        // WORST CASE SCENARIO --> STILL HASN'T BEEN ASSIGNED (FIND SOMEONE WITH SAME BUNK)

        // if (!assigned) {
        //   for (const staffer of allAssignedStaffers) {
        //     if (staffer.gender !== "Female") continue;

        //     const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
        //     if (alreadyAssigned.length < 2) {
        //       const otherCamper = this.getCamperById(alreadyAssigned[0]) || camper;
        //       if (otherCamper.bunk == camper.bunk) {
        //         this.schedule.buddies[staffer.id].push(camper.id);
        //         assigned = true;
        //         break;
        //       }
        //     }
        //   }
        // }
      }
    
      // 4. Assign male campers (same idea but with male staffers)
      for (const camper of maleCampers) {
        let assigned = false;

        // Loop through staffers/admins and assign to one that has no campers
        for (const staffer of allAssignedStaffers) {

          const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
          const prevBuddies = this.otherFreeplayBuddies[staffer.id] || [];

          // Check buddy conflict (camper.id appears in staffer's prevBuddies)
          const hasConflict = prevBuddies.includes(camper.id);

          if (!hasConflict && alreadyAssigned.length == 0) {
            if (staffer.role === "STAFF") {
              if (staffer.bunk !== camper.bunk) {
                assigned = true;
                this.schedule.buddies[staffer.id] = [camper.id];
              }
            } else {
              assigned = true;
              this.schedule.buddies[staffer.id] = [camper.id];
            }
          }
        }
      
        // Fallback: assign to any staffer with < 2 campers
        if (!assigned) {
          for (const staffer of allAssignedStaffers) {
      
            const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
            if (alreadyAssigned.length < 2) {
              if (alreadyAssigned.length == 0) {

                // edge case:
                  // if the camper hasn't been assigned already, there is a chance that it could be assigned...
                  // ... to an admin/staffer they have been with, or have the same bunk with here

                this.schedule.buddies[staffer.id] = [camper.id];
                assigned = true;
                break;

              } else {
                const otherCamper = this.getCamperById(alreadyAssigned[0]) || camper;
                if (otherCamper.bunk == camper.bunk) {
                  this.schedule.buddies[staffer.id].push(camper.id);
                  assigned = true;
                  break;
                }
              }
            }
          }
        }

        // WORST CASE SCENARIO --> STILL HASN'T BEEN ASSIGNED

        // if (!assigned) {
        //   for (const staffer of allAssignedStaffers) {

        //     const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
        //     if (alreadyAssigned.length < 2) {
        //       const otherCamper = this.getCamperById(alreadyAssigned[0]) || camper;
        //       if (otherCamper.bunk == camper.bunk) {
        //         this.schedule.buddies[staffer.id].push(camper.id);
        //         assigned = true;
        //         break;
        //       }
        //     }
        //   }
        // }
      }

      return this;
    }

  getSchedule() { return this.schedule; }
}
