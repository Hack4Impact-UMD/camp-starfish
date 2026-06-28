import { StaffAttendee, CamperAttendee, AdminAttendee, Attendee, DaysOffSchedule, Section } from "@/types/sessions/sessionTypes";
import { BundleSectionSchedule, SectionActivityPreferences } from "@/types/scheduling/schedulingTypes";
import shuffle from "@/utils/data/shuffle";
import { canBeAssignedToIndividualActivityAssignments, getYesYesListGroups } from "./schedulingUtils";
import { getBlockIdFromNum } from "@/types/scheduling/schedulingUtils";
import partition from "@/utils/data/partition";
import { groupBy } from "@/utils/data/groupBy";
import { isDayInRange } from "@/utils/timeUtils";
import { sectionTypes } from "@/types/sessions/sessionUtils";
import { el } from "@faker-js/faker";
import BlockRatiosGrid from "../exporting/BlockRatiosGrid";

interface GenerateBundleScheduleRequest {
  attendees: Attendee[];
  camperActivityPreferences: SectionActivityPreferences;
  currentSchedule: BundleSectionSchedule;
  daysOffSchedule: DaysOffSchedule;
  section: Section;
  isFirstBundleOfSession: boolean;
}

export default function generateBundleSchedule(req: GenerateBundleScheduleRequest): BundleSectionSchedule {
  const { attendees, camperActivityPreferences, currentSchedule, daysOffSchedule, section, isFirstBundleOfSession } = req;

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

  const newSchedule: BundleSectionSchedule = {
    sessionId: currentSchedule.sessionId,
    sectionId: currentSchedule.sectionId,
    type: "BUNDLE",
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
    }, {} as BundleSectionSchedule["blocks"]),
    alternatePeriodsOff: Object.entries(currentSchedule.alternatePeriodsOff).reduce((prev, [periodId, _counselorIds]) => {
      prev[periodId] = [];
      return prev;
    }, {} as BundleSectionSchedule["alternatePeriodsOff"]),
  }

  const { trueGroup: programCounselors, falseGroup: remainingStaff } = partition(staff, staffer => staffer.programCounselorFor !== undefined);
  const programCounselorsByProgramArea = groupBy(programCounselors, programCounselor => programCounselor.programCounselorFor!);
  for (const [_blockId, block] of Object.entries(newSchedule.blocks)) {
    for (const activity of block.activities) {
      const eligibleProgramCounselors = programCounselorsByProgramArea[activity.programAreaId]?.filter(programCounselor => daysOffSchedule.daysOffByCounselorId[programCounselor.attendeeId].every(dayOff => !isDayInRange(dayOff, [section.startDate, section.endDate])));
      if (!eligibleProgramCounselors) {
        continue;
      }
      activity.adminIds.push(...eligibleProgramCounselors.map(counselor => counselor.attendeeId));
    }
  }

  const { trueGroup: navCampers, falseGroup: ocpCampers } = partition(campers, camper => camper.ageGroup === "NAV");

  const navSwimActivities = Object.entries(newSchedule.blocks).map(([_blockId, block]) => block.activities.find(activity => activity.programAreaId === "WF" && activity.ageGroup === "NAV")).filter(activity => !!activity);
  const maxNavCampersPerSwimActivity = Math.ceil(navCampers.length / navSwimActivities.length);
  for (const camper of shuffle(navCampers)) {
    let eligibleSwimActivities = navSwimActivities.filter(swimActivity => swimActivity.camperIds.length < maxNavCampersPerSwimActivity && canBeAssignedToIndividualActivityAssignments(camper, swimActivity));
    if (eligibleSwimActivities.length === 0) {
      eligibleSwimActivities = navSwimActivities.filter(swimActivity => canBeAssignedToIndividualActivityAssignments(camper, swimActivity));
      if (eligibleSwimActivities.length === 0) {
        eligibleSwimActivities = navSwimActivities;
      }
    }
    const chosenSwimActivity = shuffle(eligibleSwimActivities)[0];
    chosenSwimActivity.camperIds.push(camper.attendeeId);
  }

  const ocpCampersNeedingSwimActivities = ocpCampers.filter(camper => isFirstBundleOfSession || (camper.level >= 4 && camper.isOptedOutFromSwim));
  const ocpSwimActivities = Object.values(newSchedule.blocks).map((block) => block.activities.find(activity => activity.programAreaId === "WF" && activity.ageGroup === "OCP")).filter(activity => !!activity);
  const maxOcpCampersPerSwimActivity = Math.ceil(ocpCampersNeedingSwimActivities.length / navSwimActivities.length);
  for (const camper of shuffle(ocpCampersNeedingSwimActivities)) {
    let eligibleSwimActivities = ocpSwimActivities.filter(swimActivity => swimActivity.camperIds.length < maxOcpCampersPerSwimActivity && canBeAssignedToIndividualActivityAssignments(camper, swimActivity));
    if (eligibleSwimActivities.length === 0) {
      eligibleSwimActivities = ocpSwimActivities.filter(swimActivity => canBeAssignedToIndividualActivityAssignments(camper, swimActivity));
      if (eligibleSwimActivities.length === 0) {
        eligibleSwimActivities = ocpSwimActivities;
      }
    }
    const chosenSwimActivity = shuffle(eligibleSwimActivities)[0];
    chosenSwimActivity.camperIds.push(camper.attendeeId);
  }

  const ocpChatActivities = Object.values(newSchedule.blocks).map((block) => block.activities.find(activity => activity.programAreaId === "OCP")).filter(activity => !!activity);
  const maxOcpCampersPerChatActivity = Math.ceil(ocpCampers.length / ocpChatActivities.length);
  for (const camper of shuffle(ocpCampers)) {
    let eligibleOcpChatActivities = ocpChatActivities.filter(ocpChatActivity => ocpChatActivity.camperIds.length < maxOcpCampersPerChatActivity && canBeAssignedToIndividualActivityAssignments(camper, ocpChatActivity));
    if (eligibleOcpChatActivities.length === 0) {
      eligibleOcpChatActivities = ocpChatActivities.filter(ocpChatActivity => canBeAssignedToIndividualActivityAssignments(camper, ocpChatActivity));
      if (eligibleOcpChatActivities.length === 0) {
        eligibleOcpChatActivities = ocpChatActivities;
      }
    }
    const chosenOcpChatActivity = shuffle(eligibleOcpChatActivities)[0];
    chosenOcpChatActivity.camperIds.push(camper.attendeeId);
  }

  for (const [blockId, block] of Object.entries(newSchedule.blocks)) {
    const sortedCampers = shuffle(campers).sort((a, b) => b.snapshot.dateOfBirth.diff(a.snapshot.dateOfBirth, "years"));
    const maxCampersPerActivity = Math.ceil(sortedCampers.length / block.activities.length);
    for (const camper of sortedCampers) {
      const camperPrefs = camperActivityPreferences.blocks[blockId][camper.attendeeId];
      let eligibleActivities = block.activities.filter((activity) => activity.camperIds.length < maxCampersPerActivity && canBeAssignedToIndividualActivityAssignments(camper, activity));
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

    const maxCounselorsPerActivity = Math.ceil((adminsToAssign.length + staffToAssign.length) / block.activities.length);

    const numAdminsAssigned = Math.min(admins.length, block.activities.length);
    const shuffledActivities = shuffle(block.activities);
    for (let i = 0; i < numAdminsAssigned; i++) {
      shuffledActivities[i].adminIds.push(adminsToAssign[i].attendeeId);
    }

    if (numAdminsAssigned !== admins.length) {
      const remainingAdmins = adminsToAssign.slice(numAdminsAssigned);
      for (const admin of remainingAdmins) {
        let eligibleActivities = block.activities.filter((activity) => activity.adminIds.length + activity.staffIds.length < maxCounselorsPerActivity && canBeAssignedToIndividualActivityAssignments(admin, activity));
        if (eligibleActivities.length === 0) {
          eligibleActivities = block.activities;
        }
        const chosenActivity = shuffle(eligibleActivities)[0];
        chosenActivity.adminIds.push(admin.attendeeId);
      }
    }

    for (const staffMember of staffToAssign) {
      let eligibleActivities = block.activities.filter((activity) => activity.adminIds.length + activity.staffIds.length < maxCounselorsPerActivity && canBeAssignedToIndividualActivityAssignments(staffMember, activity));
      if (eligibleActivities.length === 0) {
        eligibleActivities = block.activities;
      }
      const chosenActivity = shuffle(eligibleActivities)[0];
      chosenActivity.staffIds.push(staffMember.attendeeId);
    }
  }

  return newSchedule;
}