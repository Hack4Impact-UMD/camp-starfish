import { Staff } from "@/types/personTypes";
import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, Freeplay, PostID, FreeplayID } from "@/types/sessionTypes";
import { a } from "framer-motion/dist/types.d-BJcRxCew";
import { doesConflictExist } from "./schedulingUtils";

export class FreeplayScheduler {
  /* The current freeplay schedule */
  schedule: FreeplayID = { posts: {}, buddies: {}, id: "", sessionId: "" };

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

  withSchedule(schedule: FreeplayID): FreeplayScheduler { this.schedule = schedule; return this; }

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
    ).filter(admin => !admin.daysOff.includes(this.schedule.id));
    


    const availableStaff = this.staff.filter(staff =>
      !this.assignedStaff.some(assigned => assigned.id === staff.id)
    ).filter(staff => !staff.daysOff.includes(this.schedule.id));


    console.log("Available Staff: ", availableStaff);
    console.log("Available Admins: ", availableAdmins);
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
    // First filter out by days off
    const availableStaff = this.staff.filter(staff => !staff.daysOff.includes(this.schedule.id)).filter(staff => !this.assignedStaff.some(assigned => assigned.id === staff.id) );


    //const allAssignedStaffers = [...this.assignedStaff, ...this.assignedAdmin];


    const allFemaleStaff = availableStaff.filter(c => c.gender == "Female");
    const allfemaleCampers = this.campers.filter(c => c.gender === "Female");

    const allOtherCampers = this.campers.filter(c => c.gender !== "Female" );

    console.log("Female Campers: ", allfemaleCampers);
    console.log("Female Staff: ", allFemaleStaff);

    // 2. Assign female campers
    for (const camper of allfemaleCampers) {
      let assigned = this.assignToOpenStaffFirstStep(allFemaleStaff, camper);

      // Fallback: assign to any female staffer with another camper of the same bunk
      if (!assigned) {
        assigned = this.assignToOpenStaffSecondStep(allFemaleStaff, camper);
      }

      if (!assigned) {
        assigned = this.assignToOpenStaffThirdStep(allFemaleStaff, camper);
      }

      if (!assigned) {
        console.warn("No staffer available for camper: ", camper);
      }
    }

    const allOtherStaff = availableStaff.filter(c => !this.schedule.buddies[c.id]  || this.schedule.buddies[c.id].length == 0);

  
    // 3. Assign male campers
    for (const camper of allOtherCampers) {
      let assigned = this.assignToOpenStaffFirstStep(allOtherStaff, camper);
    
      // Fallback: assign to any staffer with another camper of the same bunk
      if (!assigned) {
        assigned = this.assignToOpenStaffSecondStep(allOtherStaff, camper);
      }

      if (!assigned) {
        assigned = this.assignToOpenStaffThirdStep(allOtherStaff, camper);
      }

      if (!assigned) {
        console.warn("No staffer available for camper: ", camper);
      }
    }

    return this;
  }

  // Assigns camper to any staffer (not in same bunk)that they weren't assigned to before
  assignToOpenStaffFirstStep(allAssignedStaffers: (StaffAttendeeID | AdminAttendeeID)[], camper: CamperAttendeeID) {
    let assigned = false;

    // Loop through female staffers/admins first
    for (const staffer of allAssignedStaffers) {


      // Checks if staffer is already assigned to a camper
      const alreadyAssigned = this.schedule.buddies[staffer.id] || [];

      // Checks if staffer was already assigned to this camper in a previous iteration
      const prevBuddies = this.otherFreeplayBuddies[staffer.id] || [];

      // Check buddy conflict (camper.id appears in staffer's prevBuddies) and if camper-staff conflict exists
      const hasConflict = prevBuddies.includes(camper.id) || doesConflictExist(staffer, [camper.id]);

      if (!hasConflict && alreadyAssigned.length == 0) {
        if ( (staffer.role === "STAFF" && staffer.bunk !== camper.bunk)) {

          if (!this.schedule.buddies[staffer.id]) {
            this.schedule.buddies[staffer.id] = [];
          }
          this.schedule.buddies[staffer.id].push(camper.id);
          assigned = true;
          break;
        }
      }
    }

    return assigned
  }

  // Assigns camper to any staffer with another camper of the same bunk
  assignToOpenStaffSecondStep(allAssignedStaffers: (StaffAttendeeID | AdminAttendeeID)[], camper: CamperAttendeeID) {

    let assigned = false;


    for (const staffer of allAssignedStaffers) {


      const prevBuddies = this.otherFreeplayBuddies[staffer.id] || []
      const hasConflict = prevBuddies.includes(camper.id) || doesConflictExist(staffer, [camper.id]);

      if (hasConflict) {
        continue;
      }
      const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
      if (alreadyAssigned.length == 1) {

        const otherCamper = this.getCamperById(alreadyAssigned[0]);

        if (!otherCamper) {
          continue;
        }

        if (otherCamper.bunk == camper.bunk && otherCamper.id !== camper.id) {
          this.schedule.buddies[staffer.id].push(camper.id);
          assigned = true;

          break;
        }

      }
    }

    return assigned;
  }

  assignToOpenStaffThirdStep(allAssignedStaffers: (StaffAttendeeID | AdminAttendeeID)[], camper: CamperAttendeeID) {

    let assigned = false;

    for (const staffer of allAssignedStaffers) {

      if (doesConflictExist(staffer, [camper.id])) {
        continue;
      }
      const alreadyAssigned = this.schedule.buddies[staffer.id] || [];
      if (alreadyAssigned.length == 1) {

        const otherCamper = this.getCamperById(alreadyAssigned[0]);

        if (!otherCamper) {
          continue;
        }

        if (!doesConflictExist(otherCamper, [camper.id])) {
          this.schedule.buddies[staffer.id].push(camper.id);
          assigned = true;

          break;
        }

      }
    }

    return assigned;
  }

  getSchedule() { return this.schedule; }
}