import {
  AdminAttendee,
  StaffAttendee,
  CamperAttendee,
  Attendee,
  Bunk,
} from "@/types/sessions/sessionTypes";
import { SectionActivityPreferences, BunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypes";
import { getBlockIdFromNum } from "@/types/scheduling/schedulingUtils";
import shuffle from "@/utils/data/shuffle";
import { doesConflictExist, getActivityAttendeeIds, getYesYesListGroups } from "./schedulingUtils";

interface GenerateBunkJamboreeScheduleRequest {
  attendees: Attendee[];
  bunks: Bunk[];
  bunkActivityPreferences: SectionActivityPreferences;
  currentSchedule: BunkJamboreeSectionSchedule;
}

export default function generateBunkJamboreeSchedule(req: GenerateBunkJamboreeScheduleRequest): BunkJamboreeSectionSchedule {
  const { attendees, bunks, bunkActivityPreferences, currentSchedule } = req;

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

  const newSchedule: BunkJamboreeSectionSchedule = {
    sessionId: currentSchedule.sessionId,
    sectionId: currentSchedule.sectionId,
    type: "BUNK-JAMBO",
    blocks: Object.entries(currentSchedule.blocks).reduce((prev, [blockId, _block]) => {
      prev[blockId] = {
        activities: currentSchedule.blocks[blockId].activities.map(activity => ({
          ...activity,
          adminIds: [],
          bunkNums: [],
        })),
        periodsOff: []
      };
      return prev;
    }, {} as BunkJamboreeSectionSchedule["blocks"]),
    alternatePeriodsOff: Object.entries(currentSchedule.alternatePeriodsOff).reduce((prev, [periodId, _counselorIds]) => {
      prev[periodId] = [];
      return prev;
    }, {} as BunkJamboreeSectionSchedule["alternatePeriodsOff"]),
  }

  for (const [blockId, block] of Object.entries(newSchedule.blocks)) {
    const shuffledBunks = shuffle(bunks)
    const maxBunksPerActivity = Math.ceil(shuffledBunks.length / block.activities.length);

    for (const bunk of shuffledBunks) {
      const bunkPrefs = bunkActivityPreferences.blocks[blockId][bunk.bunkNum];
      let eligibleActivities = block.activities.filter((activity) => activity.bunkNums.length < maxBunksPerActivity && true); // fix to check for conflicts 
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = eligibleActivities.sort((a, b) => bunkPrefs[a.name] - bunkPrefs[b.name])[0];
      chosenActivity.bunkNums.push(bunk.bunkNum);
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

    const maxCounselorsPerActivity = Math.ceil((adminsToAssign.length + staffToAssign.length) / block.activities.length);

    const numAdminsAssigned = Math.min(admins.length, block.activities.length);
    const shuffledActivities = shuffle(block.activities);
    for (let i = 0; i < numAdminsAssigned; i++) {
      shuffledActivities[i].adminIds.push(adminsToAssign[i].attendeeId);
    }

    if (numAdminsAssigned !== admins.length) {
      const remainingAdmins = adminsToAssign.slice(numAdminsAssigned);
      for (const admin of remainingAdmins) {
        let eligibleActivities = block.activities.filter((activity) => activity.adminIds.length + activity.staffIds.length < maxCounselorsPerActivity && !doesConflictExist(admin, getActivityAttendeeIds(activity)));
        if (eligibleActivities.length === 0) {
          eligibleActivities = block.activities;
        }
        const chosenActivity = shuffle(eligibleActivities)[0];
        chosenActivity.adminIds.push(admin.attendeeId);
      }
    }

    for (const staffMember of staffToAssign) {
      let eligibleActivities = block.activities.filter((activity) => activity.adminIds.length + activity.staffIds.length < maxCounselorsPerActivity && !doesConflictExist(staffMember, getActivityAttendeeIds(activity)));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = shuffle(eligibleActivities)[0];
      chosenActivity.staffIds.push(staffMember.attendeeId);
    }
  }

  return newSchedule;
}