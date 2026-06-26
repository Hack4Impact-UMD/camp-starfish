import {
  AdminAttendee,
  StaffAttendee,
  CamperAttendee,
  Attendee,
} from "@/types/sessions/sessionTypes";
import { SectionActivityPreferences, NonBunkJamboreeSectionSchedule, NonBunkJamboreeActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import { getBlockIdFromNum } from "@/types/scheduling/schedulingUtils";
import shuffle from "@/utils/data/shuffle";
import { doesConflictExist, getActivityAttendeeIds, getYesYesListGroups } from "./schedulingUtils";

interface GenerateNonBunkJamboreeScheduleRequest {
  attendees: Attendee[];
  sectionActivityPreferences: SectionActivityPreferences;
  currentSchedule: NonBunkJamboreeSectionSchedule;
}

/*
Requirements:
1. 1:1 Ratio
2. Evenish split between activities - done
3. Counselors assigned randomly to activities & periods off - done
4. Respect nonoList - done
5. Respect yesyesList - done
6. Campers assigned by activity preferences - done
7. Each activity has at least 1 admin

*/

export default function generateNonBunkJamboreeSchedule(req: GenerateNonBunkJamboreeScheduleRequest): NonBunkJamboreeSectionSchedule {
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
    blocks: Object.entries(currentSchedule.blocks).reduce((prev, [blockId, _block]) => {
      prev[blockId] = {
        activities: currentSchedule.blocks[blockId].activities.map(activity => ({
          ...activity,
          camperIds: [],
          staffIds: [],
          adminIds: [],
        })),
        periodsOff: []
      };
      return prev;
    }, {} as NonBunkJamboreeSectionSchedule["blocks"]),
    alternatePeriodsOff: Object.entries(currentSchedule.alternatePeriodsOff).reduce((prev, [periodId, _counselorIds]) => {
      prev[periodId] = [];
      return prev;
    }, {} as NonBunkJamboreeSectionSchedule["alternatePeriodsOff"]),
  }

  for (const [blockId, block] of Object.entries(newSchedule.blocks)) {
    const sortedCampers = shuffle(campers).sort((a, b) => b.snapshot.dateOfBirth.diff(a.snapshot.dateOfBirth, "years"));
    const maxCampersPerActivity = Math.ceil(sortedCampers.length / block.activities.length);
    for (const camper of sortedCampers) {
      const camperPrefs = sectionActivityPreferences.blocks[blockId][camper.attendeeId];
      let eligibleActivities = block.activities.filter((activity) => activity.camperIds.length < maxCampersPerActivity && !doesConflictExist(camper, getActivityAttendeeIds(activity)));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = eligibleActivities.sort((a, b) => camperPrefs[a.name] - camperPrefs[b.name])[0];
      chosenActivity.camperIds.push(camper.attendeeId);
    }
  }

  const yesyesListGroups = getYesYesListGroups([...shuffle(admins), ...shuffle(staff)]);
  const numBlocks = Object.keys(newSchedule.blocks).length;
  let currBlockNum = 0;
  for (const yesyesListGroup of yesyesListGroups) {
    newSchedule.blocks[getBlockIdFromNum(currBlockNum)].periodsOff.push(...yesyesListGroup);
    currBlockNum = (currBlockNum + 1) % numBlocks;
  }

  for (const [_blockId, block] of Object.entries(newSchedule.blocks)) {
    const adminsToAssign = shuffle(admins.filter((admin) => !block.periodsOff.includes(admin.attendeeId)));
    const staffToAssign = shuffle(staff.filter((staffMember) => !block.periodsOff.includes(staffMember.attendeeId)));

    const numAdminsAssigned = Math.min(admins.length, block.activities.length);
    const shuffledActivities = shuffle(block.activities);
    for (let i = 0; i < numAdminsAssigned; i++) {
      shuffledActivities[i].adminIds.push(adminsToAssign[i].attendeeId);
    }

    if (numAdminsAssigned !== admins.length) {
      const remainingAdmins = adminsToAssign.slice(numAdminsAssigned);
      for (const admin of remainingAdmins) {
        let eligibleActivities = block.activities.filter((activity) => !doesConflictExist(admin, getActivityAttendeeIds(activity)));
        if (eligibleActivities.length === 0) {
          eligibleActivities = block.activities;
        }
        const chosenActivity = shuffle(eligibleActivities)[0];
        chosenActivity.adminIds.push(admin.attendeeId);
      }
    }

    for (const staffMember of staffToAssign) {
        let eligibleActivities = block.activities.filter((activity) => !doesConflictExist(staffMember, getActivityAttendeeIds(activity)));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = shuffle(eligibleActivities)[0];
      chosenActivity.staffIds.push(staffMember.attendeeId);
    }
  }

  return newSchedule;
}