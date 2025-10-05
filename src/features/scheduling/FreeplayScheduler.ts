import { Staff } from "@/types/personTypes";
import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, Freeplay, PostID } from "../../types/sessionTypes";

export class FreeplayScheduler {
  /* The current freeplay schedule */
  schedule: Freeplay = { posts: {}, buddies: {} };

  /* The session attendees that still need to be assigned */
  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  assignedStaff: StaffAttendeeID[] = [];
  assignedAdmin: AdminAttendeeID[] = [];

  posts: PostID[] = [];

  /* The freeplay buddies from other freeplays in this session */
  otherFreeplayBuddies: { [attendeeId: number]: number[] } = {};

  // postInfo includes a list of all posts with PostID information (necessary for requiresAdmin flag) --> schedule only includes string of IDs
  constructor() { }

  withSchedule(schedule: Freeplay): FreeplayScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendeeID[]): FreeplayScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendeeID[]): FreeplayScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): FreeplayScheduler { this.admins = admins; return this; }

  withPosts(posts: PostID[]): FreeplayScheduler { this.posts = posts; return this; }

  getCamperById = (id: number) => this.campers.find(c => c.id === id);

  getPostByID = (id: string) => this.posts.find(p => p.name === id);

  // withOtherFreeplays should build the previousFreeplayBuddies object
  withOtherFreeplays(otherFreeplays: Freeplay[]): FreeplayScheduler {
    for (const freeplay of otherFreeplays) {
      for (const buddieIDStr in freeplay.buddies) {
        const buddieID = Number(buddieIDStr);
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
    const availableAdmins = this.admins.filter(admin =>
      !this.assignedAdmin.some(assigned => assigned.id === admin.id)
    );
    const availableStaff = this.staff.filter(staff =>
      !this.assignedStaff.some(assigned => assigned.id === staff.id)
    )

    // assign all ADMIN-only roles first
    for (const postID in this.schedule.posts) {
      const assigned = this.schedule.posts[postID];
      const post = this.getPostByID(postID);
      if (assigned.length == 0 && post?.requiresAdmin) {
        if (availableAdmins.length > 0) {
          const adminID: AdminAttendeeID = availableAdmins.shift()!;
          this.schedule.posts[postID] = [adminID.id];
          this.assignedAdmin.push(adminID);
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
    const allAssignedStaffers = [...this.assignedStaff, ...this.assignedAdmin];
    const allAssignedFemaleStaffers = allAssignedStaffers.filter(c => c.gender == "Female");

    // 1. Split campers by gender
    const femaleCampers = this.campers.filter(c => c.gender === "Female");
    const maleCampers = this.campers.filter(c => c.gender !== "Female");

    // 2. Assign female campers
    for (const camper of femaleCampers) {
      let assigned = this.assignToOpenStaffFirstStep(allAssignedFemaleStaffers, camper);

      // Fallback: assign to any female staffer with another camper of the same bunk
      if (!assigned) {
        this.assignToOpenStaffSecondStep(allAssignedFemaleStaffers, camper);
      }
    }
  
    // 3. Assign male campers
    for (const camper of maleCampers) {
      let assigned = this.assignToOpenStaffFirstStep(allAssignedStaffers, camper);
    
      // Fallback: assign to any staffer with another camper of the same bunk
      if (!assigned) {
        this.assignToOpenStaffSecondStep(allAssignedStaffers, camper);
      }
    }

    return this;
  }

  assignToOpenStaffFirstStep(allAssignedStaffers: (StaffAttendeeID | AdminAttendeeID)[], camper: CamperAttendeeID) {
    let assigned = false;

    // Loop through female staffers/admins first
    for (const staffer of allAssignedStaffers) {

      const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
      const prevBuddies = this.otherFreeplayBuddies[staffer.id] || [];

      // Check buddy conflict (camper.id appears in staffer's prevBuddies)
      const hasConflict = prevBuddies.includes(camper.id);

      if (!hasConflict && alreadyAssigned.length == 0) {
        if ( (staffer.role === "STAFF" && staffer.bunk !== camper.bunk) || staffer.role !== "STAFF" ) {
          this.schedule.buddies[staffer.id] = [camper.id];
          assigned = true;
          break;
        }
      }
    }

    return assigned
  }

  assignToOpenStaffSecondStep(allAssignedStaffers: (StaffAttendeeID | AdminAttendeeID)[], camper: CamperAttendeeID) {
    for (const staffer of allAssignedStaffers) {

      const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
      if (alreadyAssigned.length == 1) {

        const otherCamper = this.getCamperById(alreadyAssigned[0]) || camper;
        if (otherCamper.bunk == camper.bunk && otherCamper.id !== camper.id) {
          this.schedule.buddies[staffer.id].push(camper.id);
          break;
        }

      }
    }
  }

  getSchedule() { return this.schedule; }
}
