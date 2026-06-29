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
import { canBeAssignedToBunkAssignments, getYesYesListGroups } from "./schedulingUtils";
import { toRecord } from "@/utils/data/toRecord";

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
  const campersById = toRecord(campers, campers => campers.attendeeId);
  const staffById = toRecord(staff, staff => staff.attendeeId);

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

  const bunksByBunkNum = toRecord(bunks, bunks => bunks.bunkNum);  
  for (const [blockId, block] of Object.entries(newSchedule.blocks)) {
    const shuffledBunks = shuffle(bunks)
    const maxBunksPerActivity = Math.ceil(shuffledBunks.length / block.activities.length);

    for (const bunk of shuffledBunks) {
      const bunkMembersById = toRecord([...bunk.camperIds.map((camperId: number) => campersById[camperId]), ...bunk.counselorIds.map((counselorId: number) => staffById[counselorId])], (bunkMember: CamperAttendee | StaffAttendee) => bunkMember.attendeeId);
      const bunkPrefs = bunkActivityPreferences.blocks[blockId][bunk.bunkNum];
      let eligibleActivities = block.activities.filter((activity) => activity.bunkNums.length < maxBunksPerActivity && canBeAssignedToBunkAssignments(bunk, activity, bunksByBunkNum, bunkMembersById));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = eligibleActivities.sort((a, b) => bunkPrefs[a.name] - bunkPrefs[b.name])[0];
      chosenActivity.bunkNums.push(bunk.bunkNum);
    }
  }

  const yesyesListGroups = getYesYesListGroups([...shuffle(admins), ...shuffle(staff).sort((a, b) => a.bunk - b.bunk)]);
  const numBlocks = Object.keys(newSchedule.blocks).length;
  let currBlockNum = 0;
  for (const yesyesListGroup of yesyesListGroups) {
    newSchedule.blocks[getBlockIdFromNum(currBlockNum)].periodsOff.push(...yesyesListGroup);
    currBlockNum = (currBlockNum + 1) % numBlocks;
  }

  for (const [_blockId, block] of Object.entries(newSchedule.blocks)) {
    const adminsToAssign = shuffle(admins.filter((admin) => !block.periodsOff.includes(admin.attendeeId)));
    const maxAdminsPerActivity = Math.ceil(adminsToAssign.length / block.activities.length);
    const numAdminsAssigned = Math.min(admins.length, block.activities.length);
    const shuffledActivities = shuffle(block.activities);
    for (let i = 0; i < numAdminsAssigned; i++) {
      shuffledActivities[i].adminIds.push(adminsToAssign[i].attendeeId);
    }

    if (numAdminsAssigned !== admins.length) {
      const remainingAdmins = adminsToAssign.slice(numAdminsAssigned);
      for (const admin of remainingAdmins) {
        let eligibleActivities = block.activities.filter((activity) => activity.adminIds.length < maxAdminsPerActivity && canBeAssignedToBunkAssignments(admin, activity, bunksByBunkNum));
        if (eligibleActivities.length === 0) {
          eligibleActivities = block.activities;
        }
        const chosenActivity = shuffle(eligibleActivities)[0];
        chosenActivity.adminIds.push(admin.attendeeId);
      }
    }
  }

  return newSchedule;
}