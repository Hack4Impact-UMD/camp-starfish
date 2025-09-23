import { Post, StaffAttendeeID, AdminAttendeeID, CamperAttendeeID } from "../../types/sessionTypes";

class FreeplayScheduler {
  /*
   An array of objects where each object represents a post and its assigned attendees.
   Each entry has:
   - `post`: the Post object
   - `assignments`: an array of attendee IDs (Admin or Staff) assigned to this post
  */
  posts: { post: Post; assignments: number[] }[] = [];

  /*
   Tracks camper buddy assignments across freeplay sessions.
   Maps a staff's attendee ID to an array of IDs representing their camper freeplay buddies.
  */
  buddies: Record<number, number[]> = {};

  /*
   Stores the previous freeplay buddies for each staff member.
   Maps a staff's attendee ID to an array of IDs representing their camper freeplay buddies.
  */
  previousFreePlayBuddies: Record<number, number[]> = {};

  /*
   Creates a new FreeplayScheduler.
   Takes in an initial list of posts with empty assignment lists.
  */
  constructor(posts: { post: Post; assignments: number[] }[], previousFreePlayBuddies: Record<number, number[]>) {
    this.posts = posts;
    this.previousFreePlayBuddies = previousFreePlayBuddies;
  }

  /*
   Assigns staff to posts in order of priority:
   1. Fill all posts with available Admins first.
   2. If there are still unfilled posts, assign Staff members.
   3. Then, add the remaining staff members to the posts
   The function should update `this.posts` by adding attendee IDs to each post's `assignments` array.
  */
  addAssignmentToPost(adminAttendees: AdminAttendeeID[], staffAttendees: StaffAttendeeID[]): void {}

  /*
   Assigns campers to posts according to the following rules:
   - Assign all female campers to female staff members first.
   - If there are not enough female staff members, assign multiple (MAX 2) campers of the same bunk
     to the same female staff member.
   - Assign all male campers to the remaining staff members.
   - If there are not enough staff members, assign multiple (MAX 2) campers of the same bunk
     to the same staff member.
   - Prioritize avoiding assigning the same "freeplay buddy" (previous buddy) if possible.
   Updates `this.buddies` to reflect new buddy pairings.
  */
  addCamperToPost(camperAttendees: CamperAttendeeID[], staffAttendees: StaffAttendeeID[]): void {}
}
