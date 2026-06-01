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
  const attendeesById = { ...campersById, ...staffById, ...adminsById };

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
  attendees.forEach(attendee => buddyCandidatesById[attendee.attendeeId] = new Set((attendee.role === "CAMPER" ? employeeIds : camperIds).filter(potentialCandidateId => {
    const isPotentialCandidateOnNonoList = attendee.snapshot.nonoList.includes(potentialCandidateId);
    const isPotentialCandidateBuddyInOtherFreeplay = buddiesInOtherFreeplays[attendee.attendeeId].has(potentialCandidateId);
    const areInSameBunk = areAttendeesInSameBunk(attendee, attendeesById[potentialCandidateId]);
    return !isPotentialCandidateOnNonoList && !isPotentialCandidateBuddyInOtherFreeplay && !areInSameBunk && isFemaleEmployeeAssignedToFemaleCamper(attendee, attendeesById[potentialCandidateId]);
  })));

  const unassignedCamperIds: number[] = camperIds;
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

  const campersByBunk: { [bunkNum: number]: number[] } = groupBy(camperIds, camperId => campersById[camperId].bunk);
  let ungroupedBunkNums = Object.keys(campersByBunk).map(bunkNum => Number(bunkNum));
  const numBunks = ungroupedBunkNums.length;
  const numExtraCampers = unassignedCamperIds.length - unassignedAdminIds.length - unassignedStaffIds.length;
  const numExtraCampersToGroupPerBunk = Math.floor(numExtraCampers / numBunks);
  const numBunksWithAdditionalCamperToGroup = numExtraCampers % numBunks;
  const camperGroups: (number | number[])[] = [];
  for (let i = 0; i < numBunks; i++) {
    const bunkIndex = Math.floor(Math.random() * ungroupedBunkNums.length);
    const bunkNum = ungroupedBunkNums[bunkIndex];
    ungroupedBunkNums = ungroupedBunkNums.filter((_, i) => i !== bunkIndex);
    if (i >= numExtraCampers) {
      campersByBunk[bunkNum].forEach(camperId => camperGroups.push(camperId));
      continue;
    }
    const numCampersInGroup = numExtraCampersToGroupPerBunk + (i < numBunksWithAdditionalCamperToGroup ? 1 : 0);
    const bunkGroup: number[] = [];
    for (let j = 0; j < numCampersInGroup; j++) {
      const camperIndex = Math.floor(Math.random() * campersByBunk[bunkNum].length);
      const camperId = campersByBunk[bunkNum][camperIndex];
      campersByBunk[bunkNum] = campersByBunk[bunkNum].filter((_, i) => i !== camperIndex);
      bunkGroup.push(camperId);
    }
    camperGroups.push(bunkGroup);
    campersByBunk[bunkNum].forEach(camperId => camperGroups.push(camperId));
  }

  const buddyAssignments: Freeplay["buddies"] = {};
  let camperGroupsWithBuddyCandidates = camperGroups.map(camperGroup => ({camperGroup, buddyCandidates: typeof camperGroup === "number" ? buddyCandidatesById[camperGroup] : camperGroup.reduce((prev, camperId) => prev.union(buddyCandidatesById[camperId]), new Set<number>())}))
  const numEmployeesToAssign = unassignedAdminIds.length + unassignedStaffIds.length;
  const unassignedEmployeeIds: number[] = [];
  for (let i = 0; i < numEmployeesToAssign; i++) {
    const employeeId = unassignedAdminIds.shift() ?? unassignedStaffIds.shift()!;
    const validCamperGroups = camperGroupsWithBuddyCandidates.filter(({ buddyCandidates }) => buddyCandidates.has(employeeId));
    if (validCamperGroups.length === 0) {
      unassignedEmployeeIds.push(employeeId);
      continue;
    }
    const camperGroupIndex = Math.floor(Math.random() * validCamperGroups.length);
    const assignedCamperGroup = validCamperGroups[camperGroupIndex];
    camperGroupsWithBuddyCandidates = camperGroupsWithBuddyCandidates.filter((_, i) => i !== camperGroupIndex);
    buddyAssignments[employeeId] = typeof assignedCamperGroup.camperGroup === "number" ? [assignedCamperGroup.camperGroup] : assignedCamperGroup.camperGroup;
  }

  // just assign unassigned employees to random camper groups, this should be a rare case, so we can fix later with a more complex algorithm
  for (let i = 0; i < unassignedEmployeeIds.length; i++) {
    const camperGroup = camperGroupsWithBuddyCandidates[i].camperGroup;
    buddyAssignments[unassignedEmployeeIds[i]] = typeof camperGroup === "number" ? [camperGroup] : camperGroup;
  }

  return {
    sessionId,
    date,
    buddies: buddyAssignments,
    posts: postAssignments
  }
}

function isFemaleEmployeeAssignedToFemaleCamper(buddy1: Attendee, buddy2: Attendee) {
  if ((buddy1.role === "CAMPER" && buddy2.role === "CAMPER") || (buddy1.role !== "CAMPER" && buddy2.role !== "CAMPER")) {
    return false;
  } else if (buddy1.role === "CAMPER") {
    return buddy1.snapshot.gender === "Female" ? buddy2.snapshot.gender === "Female" : false;
  }
  return buddy2.snapshot.gender === "Female" ? buddy1.snapshot.gender === "Female" : false;
}

function areAttendeesInSameBunk(attendee1: Attendee, attendee2: Attendee) {
  if (attendee1.role === "ADMIN" || attendee2.role === "ADMIN") {
    return false;
  }
  return attendee1.bunk === attendee2.bunk;
}