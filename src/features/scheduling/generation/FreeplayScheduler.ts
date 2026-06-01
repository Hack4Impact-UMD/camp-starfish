import { toRecord } from "@/utils/data/toRecord";
import { StaffAttendee, AdminAttendee, CamperAttendee, Freeplay, Post, Attendee } from "../../../types/sessions/sessionTypes";
import { groupBy } from "@/utils/data/groupBy";
import partition from "@/utils/data/partition";

interface GenerateFreeplayScheduleRequest {
  sessionId: string;
  date: string;
  attendees: Attendee[];
  posts: Post[];
  otherFreeplaysInSession: Freeplay[];
}

export default function generateFreeplaySchedule(req: GenerateFreeplayScheduleRequest): Freeplay {
  const { sessionId, date, attendees, posts, otherFreeplaysInSession } = req;

  // create useful data structures
  const campers: CamperAttendee[] = [];
  const staff: StaffAttendee[] = [];
  const admins: AdminAttendee[] = [];
  attendees.forEach(attendee => {
    switch (attendee.role) {
      case "CAMPER":
        campers.push(attendee);
        break;
      case "STAFF":
        staff.push(attendee);
        break;
      case "ADMIN":
        admins.push(attendee);
        break;
      default: throw Error("Unknown attendee role");
    }
  });

  const campersById = toRecord(campers, c => c.attendeeId);
  const staffById = toRecord(staff, s => s.attendeeId);
  const adminsById = toRecord(admins, a => a.attendeeId);

  const buddiesInOtherFreeplays: { [attendeeId: number]: Set<number>; } = {};
  for (const freeplay of otherFreeplaysInSession) {
    for (const [employeeIdStr, camperIds] of Object.entries(freeplay.buddies)) {
      const employeeId = Number(employeeIdStr);
      if (!(employeeId in buddiesInOtherFreeplays)) {
        buddiesInOtherFreeplays[employeeId] = new Set();
      }
      camperIds.forEach(camperId => {
        buddiesInOtherFreeplays[employeeId].add(camperId);
        if (!(camperId in buddiesInOtherFreeplays)) {
          buddiesInOtherFreeplays[camperId] = new Set();
        }
        buddiesInOtherFreeplays[camperId].add(employeeId);
      });
    }
  }

  const camperIds = campers.map(camper => camper.attendeeId);
  const employeeIds = [...staff, ...admins].map(employee => employee.attendeeId);
  const buddyCandidatesById: { [attendeeId: number]: Set<number>; } = {};
  attendees.forEach(attendee => buddyCandidatesById[attendee.attendeeId] = new Set((attendee.role === "CAMPER" ? employeeIds : camperIds).filter(potentialCandidateId => !attendee.snapshot.nonoList.includes(potentialCandidateId) && !buddiesInOtherFreeplays[attendee.attendeeId].has(potentialCandidateId) && (attendee.snapshot.gender !== "Female" || employeesById[potentialCandidateId].snapshot.gender === "Female"))));

  let unassignedCamperIds: number[] = camperIds;
  let unassignedStaffIds: number[] = staff.map(staff => staff.attendeeId);
  let unassignedAdminIds: number[] = admins.map(admin => admin.attendeeId);

  const postAssignments: Freeplay["posts"] = {};
  const numEmployeesAssignedToPosts = Math.max(posts.length, employeeIds.length - camperIds.length);
  const { trueGroup: postsRequiringAdminSupervision, falseGroup: postsNotRequiringAdminSupervision } = partition(posts, post => post.requiresAdminSupervision);
  if (postsRequiringAdminSupervision.length > unassignedAdminIds.length) {
    throw Error(`There are ${postsRequiringAdminSupervision.length} posts that require admin supervision, but there are only ${unassignedAdminIds.length} admins in the session.`);
  }
  for (const post of postsRequiringAdminSupervision) {
    const adminIndex = Math.floor(Math.random() * unassignedAdminIds.length);
    const adminId = unassignedAdminIds[adminIndex];
    postAssignments[post.id] = [adminId];
    unassignedAdminIds = unassignedAdminIds.filter((_, i) => i !== adminIndex);
  }
  for (const post of postsNotRequiringAdminSupervision) {
    if (unassignedAdminIds.length !== 0) {
      const adminIndex = Math.floor(Math.random() * unassignedAdminIds.length);
      const adminId = unassignedAdminIds[adminIndex];
      postAssignments[post.id] = [adminId];
      unassignedAdminIds = unassignedAdminIds.filter((_, i) => i !== adminIndex);
      break;
    }
    const staffIndex = Math.floor(Math.random() * unassignedStaffIds.length);
    const staffId = unassignedStaffIds[staffIndex];
    postAssignments[post.id] = [staffId];
    unassignedStaffIds = unassignedStaffIds.filter((_, i) => i !== staffIndex);
  }
  for (let i = 0; i < numEmployeesAssignedToPosts - posts.length; i++) {
    if (unassignedAdminIds.length !== 0) {
      const postIndex = Math.floor(Math.random() * posts.length);
      const postId = posts[postIndex].id;
      postAssignments[postId].push(unassignedAdminIds[0]);
      unassignedAdminIds = unassignedAdminIds.slice(1);
      break;
    }
    const postindex = Math.floor(Math.random() * postsNotRequiringAdminSupervision.length);
    const postId = postsNotRequiringAdminSupervision[postindex].id;
    postAssignments[postId].push(unassignedStaffIds[0]);
    unassignedStaffIds = unassignedStaffIds.slice(1);
  }

  // assign campers to remaining staff & admins
  const buddyAssignments: Freeplay["buddies"] = {};
  const num

  // return schedule
  return {
    sessionId,
    date,
    buddies: {},
    posts: postAssignments
  }
}