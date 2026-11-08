import {
  AdminAttendee,
  StaffAttendee,
  CamperAttendee,
  Attendee,
} from "@/types/sessions/sessionTypes";
import { ActivityPreferences, NonBunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypes";
import shuffle from "@/utils/data/shuffle";
import { canBeAssignedToIndividualActivityAssignments, getYesYesListGroups } from "./schedulingUtils";
import { objectEntries, objectKeys } from "@/utils/types/typeUtils";

interface GenerateNonBunkJamboreeScheduleRequest {
  attendees: Attendee[];
  sectionActivityPreferences: ActivityPreferences;
  currentSchedule: NonBunkJamboreeSectionSchedule;
}

export function generateNonBunkJamboreeSchedule(req: GenerateNonBunkJamboreeScheduleRequest): NonBunkJamboreeSectionSchedule {
  const { attendees, sectionActivityPreferences, currentSchedule } = req;

  const campers: CamperAttendee[] = [];
  const staff: StaffAttendee[] = [];
  const admins: AdminAttendee[] = [];
  for (const attendee of attendees) {
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
  }

  const newSchedule: NonBunkJamboreeSectionSchedule = {
    sessionId: currentSchedule.sessionId,
    sectionId: currentSchedule.sectionId,
    type: "NON-BUNK-JAMBO",
    blocks: objectEntries(currentSchedule.blocks).reduce((prev, [blockId, block]) => ({
      ...prev,
      [blockId]: {
        activities: objectEntries(block.activities).reduce((prev, [activityId, activity]) => ({
          ...prev,
          [activityId]: {
            ...activity,
            adminIds: [],
            bunkNums: [],
          }
        })),
        periodsOff: []
      }
    }), {}),
    alternatePeriodsOff: objectKeys(currentSchedule.alternatePeriodsOff).reduce((prev, periodId) => ({
      ...prev,
      [periodId]: []
    }), {})
  }

  for (const [blockId, block] of objectEntries(newSchedule.blocks)) {
    const sortedCampers = shuffle(campers).sort((a, b) => b.snapshot.dateOfBirth.diff(a.snapshot.dateOfBirth, "years"));
    const maxCampersPerActivity = Math.ceil(sortedCampers.length / Object.values(block.activities).length);
    for (const camper of sortedCampers) {
      const camperPrefs = sectionActivityPreferences.blocks[blockId][camper.attendeeId];
      let eligibleActivities = Object.values(block.activities).filter((activity) => activity.camperIds.length < maxCampersPerActivity && canBeAssignedToIndividualActivityAssignments(camper, activity));
      if (eligibleActivities.length === 0) {
        eligibleActivities = Object.values(block.activities);
      }
      const chosenActivity = eligibleActivities.sort((a, b) => camperPrefs[a.name] - camperPrefs[b.name])[0];
      chosenActivity.camperIds.push(camper.attendeeId);
    }
  }

  const yesyesListGroups = getYesYesListGroups([...shuffle(admins), ...shuffle(staff)]);
  const blocks = objectEntries(newSchedule.blocks);
  const numBlocks = blocks.length;
  let currBlockNum = 0;
  for (const yesyesListGroup of yesyesListGroups) {
    blocks[currBlockNum][1].periodsOff.push(...yesyesListGroup);
    currBlockNum = (currBlockNum + 1) % numBlocks;
  }

  for (const [_blockId, block] of Object.entries(newSchedule.blocks)) {
    const adminsToAssign = shuffle(admins.filter((admin) => !block.periodsOff.includes(admin.attendeeId)));
    const staffToAssign = shuffle(staff.filter((staffMember) => !block.periodsOff.includes(staffMember.attendeeId)));

    const maxCounselorsPerActivity = Math.ceil((adminsToAssign.length + staffToAssign.length) / Object.values(block.activities).length);

    const numAdminsAssigned = Math.min(admins.length, Object.values(block.activities).length);
    const shuffledActivities = shuffle(Object.values(block.activities));
    for (let i = 0; i < numAdminsAssigned; i++) {
      shuffledActivities[i].adminIds.push(adminsToAssign[i].attendeeId);
    }

    if (numAdminsAssigned !== admins.length) {
      const remainingAdmins = adminsToAssign.slice(numAdminsAssigned);
      for (const admin of remainingAdmins) {
        let eligibleActivities = Object.values(block.activities).filter((activity) => activity.adminIds.length + activity.staffIds.length < maxCounselorsPerActivity && canBeAssignedToIndividualActivityAssignments(admin, activity));
        if (eligibleActivities.length === 0) {
          eligibleActivities = Object.values(block.activities);
        }
        const chosenActivity = shuffle(eligibleActivities)[0];
        chosenActivity.adminIds.push(admin.attendeeId);
      }
    }

    for (const staffMember of staffToAssign) {
      let eligibleActivities = Object.values(block.activities).filter((activity) => activity.adminIds.length + activity.staffIds.length < maxCounselorsPerActivity && canBeAssignedToIndividualActivityAssignments(staffMember, activity));
      if (eligibleActivities.length === 0) {
        eligibleActivities = Object.values(block.activities);
      }
      const chosenActivity = shuffle(eligibleActivities)[0];
      chosenActivity.staffIds.push(staffMember.attendeeId);
    }
  }

  return newSchedule;
}