import { StaffAttendeeID, AdminAttendeeID, CamperAttendeeID, Freeplay } from "../../types/sessionTypes";

export class FreeplayScheduler {
  /* The current freeplay schedule */
  schedule: Freeplay = { posts: {}, buddies: {} };

  /* The session attendees that still need to be assigned */
  campers: CamperAttendeeID[] = [];
  staff: StaffAttendeeID[] = [];
  admins: AdminAttendeeID[] = [];

  /* The freeplay buddies from other freeplays in this session */
  otherFreeplayBuddies: { [attendeeId: number]: number[] } = {};

  constructor() { }

  withSchedule(schedule: Freeplay): FreeplayScheduler { this.schedule = schedule; return this; }

  withCampers(campers: CamperAttendeeID[]): FreeplayScheduler { this.campers = campers; return this; }

  withStaff(staff: StaffAttendeeID[]): FreeplayScheduler { this.staff = staff; return this; }

  withAdmins(admins: AdminAttendeeID[]): FreeplayScheduler { this.admins = admins; return this; }

  // withOtherFreeplays should build the previousFreeplayBuddies object
  withOtherFreeplays(otherFreeplays: Freeplay[]): FreeplayScheduler { return this; }

  /* Assigns ADMINs to all posts that require ADMINs and either STAFF or ADMINs to all other posts */
  assignPosts() { return this; }

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
  assignCampers() { return this; }

  getSchedule() { return this.schedule; }
}
