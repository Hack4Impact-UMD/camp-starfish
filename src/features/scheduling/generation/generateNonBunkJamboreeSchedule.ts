/* Campers have been assigned individually instead of by bunk*/
import {
  AdminAttendee,
  StaffAttendee,
  CamperAttendee,
  Attendee,
} from "@/types/sessions/sessionTypes";
import { SectionActivityPreferences, NonBunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypes";
import { getBlockIdFromNum } from "@/types/scheduling/schedulingUtils";
import shuffle from "@/utils/data/shuffle";
import { doesConflictExist, getActivityAttendeeIds } from "./schedulingUtils";

interface GenerateNonBunkJamboreeScheduleRequest {
  attendees: Attendee[];
  sectionActivityPreferences: SectionActivityPreferences;
  currentSchedule: NonBunkJamboreeSectionSchedule;
}

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
    for (const camper of sortedCampers) {
      const camperPrefs = sectionActivityPreferences.blocks[blockId][camper.attendeeId];
      let eligibleActivities = block.activities.filter((activity) => !doesConflictExist(camper, getActivityAttendeeIds(activity)));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = eligibleActivities.sort((a, b) => camperPrefs[a.name] - camperPrefs[b.name])[0];
      chosenActivity.camperIds.push(camper.attendeeId);
    }
  }

  const numBlocks = Object.keys(newSchedule.blocks).length;
  let currBlockNum = 0;
  const shuffledStaff = shuffle(staff);
  const shuffledAdmins = shuffle(admins);
  for (const counselor of [...shuffledStaff, ...shuffledAdmins]) {
    newSchedule.blocks[getBlockIdFromNum(currBlockNum)].periodsOff.push(counselor.attendeeId);
    currBlockNum = (currBlockNum + 1) % numBlocks;
  }

  for (const [_blockId, block] of Object.entries(newSchedule.blocks)) {
    for (const staffMember of staff) {
      let eligibleActivities = block.activities.filter((activity) => !doesConflictExist(staffMember, getActivityAttendeeIds(activity)));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = shuffle(eligibleActivities)[0];
      chosenActivity.staffIds.push(staffMember.attendeeId);
    }

    for (const admin of admins) {
      let eligibleActivities = block.activities.filter((activity) => !doesConflictExist(admin, getActivityAttendeeIds(activity)));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = shuffle(eligibleActivities)[0];
      chosenActivity.adminIds.push(admin.attendeeId);
    }
  }

  return newSchedule;
}