import { db, storage } from "@/config/firebase"; // your config file
import { doc, setDoc } from "firebase/firestore";
import { BundleScheduler } from "../BundleScheduler";
import { CamperAttendeeID, StaffAttendeeID, AdminAttendeeID, AgeGroup, SectionSchedule, BundleBlockActivities, ProgramArea, SectionPreferences, BlockPreferences, Section } from "@/types/sessionTypes";
import { Camper } from "@/types/personTypes";

function generateCampers(totalCampers: number, numberBunks: number): CamperAttendeeID[] {
  const campers: CamperAttendeeID[] = [];

  
  for (let i = 0; i < totalCampers; i++) {

    const id = Math.floor(Math.random() * 1000) + 1;
    const name = {
      firstName: Math.random().toString(36).slice(2),
      middleName: Math.random().toString(36).slice(2),
      lastName: Math.random().toString(36).slice(2),
    };

    const gender = Math.random() < 0.5 ? "Male" : "Female";

    // Random DOB
    const currentYear = new Date().getFullYear();
    const start = new Date(currentYear - 18, 0, 1);
    const end = new Date(currentYear - 7, 11, 31);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const birthDate = new Date(randomTime);
    const dateOfBirth = birthDate.toISOString();

    // Determines age group based on DOB
    const age = currentYear - birthDate.getFullYear();
    const ageGroup: AgeGroup = age >= 14 ? "OCP" : "NAV";

    const level = Math.floor(Math.random() * 5) + 1;

    const bunk = Math.floor(i / numberBunks) + 1; 

    let swimOptOut = false;
    if(ageGroup === "OCP" && level > 4) {
      swimOptOut = Math.random() < 0.5 ? true : false;
    }

    campers.push({
      id: id,
      name: name,
      gender: gender,
      dateOfBirth: dateOfBirth,
      nonoList: [],
      role: "CAMPER",
      ageGroup: ageGroup,
      level: level,
      bunk: bunk,
      swimOptOut: swimOptOut,
      sessionId: "session1",
    });
  }

  return campers;
}

function generateStaff(totalStaff: number, numberBunks: number): StaffAttendeeID[] {
  const staff: StaffAttendeeID[] = [];

  
  for (let i = 0; i < totalStaff; i++) {

    const id = Math.floor(Math.random() * 1000) + 1;
    const name = {
      firstName: Math.random().toString(36).slice(2),
      middleName: Math.random().toString(36).slice(2),
      lastName: Math.random().toString(36).slice(2),
    };

    const gender = Math.random() < 0.5 ? "Male" : "Female";

    const bunk = Math.floor(i / numberBunks) + 1; 

    const leadBunkCounselor = Math.floor(i / numberBunks) === 0 ? true : false;

    staff.push({
      id: id,
      name: name,
      gender: gender,
      nonoList: [],
      yesyesList: [],
      role: "STAFF",
      bunk: bunk,
      leadBunkCounselor: leadBunkCounselor,
      daysOff: [],
      sessionId: "session1",

    });
  }

  return staff;
}

function generateAdmins(totalAdmins: number): AdminAttendeeID[] {
  const admins: AdminAttendeeID[] = [];

  for(let i = 0; i < totalAdmins; i++) {
    const id = Math.floor(Math.random() * 1000) + 1;
    const name = {
      firstName: Math.random().toString(36).slice(2),
      middleName: Math.random().toString(36).slice(2),
      lastName: Math.random().toString(36).slice(2),
    };

    const gender = Math.random() < 0.5 ? "Male" : "Female";

    admins.push({
      id: id,
      name: name,
      gender: gender,
      nonoList: [],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
      sessionId: "session1",
    });

  }

  return admins;

}

function generateBlockSchedule(blockIDs: string[]) {

  const schedule: SectionSchedule<'BUNDLE'> = { blocks: {}, alternatePeriodsOff: {} };


  for(let i = 0; i < blockIDs.length; i++)
  {
    const activities: BundleBlockActivities = generateActivities(7);
    const periodsOff: number[] = [];
    schedule.blocks[blockIDs[i]] = { activities: activities, periodsOff: periodsOff };
  }

  return schedule;

}

function generateBlockIDs(totalBlocks: number): string[] {

  const blockIDs: string[] = [];


  for(let i = 0; i < totalBlocks; i++)
  {
    const letter = String.fromCharCode(65 + i);
    blockIDs.push(letter);
  }

  return blockIDs;

}
function generateActivities(totalActivities: number) {
  const activities: BundleBlockActivities = [];

  const possibleProgramAreas: ProgramArea[] = [
    { name: "Activate", isDeleted: false },
    { name: "Arts & Crafts", isDeleted: false },
    { name: "Athletics", isDeleted: false },
    { name: "Boating", isDeleted: false },
    { name: "Challenge", isDeleted: false },
    { name: "Dance", isDeleted: false },
    { name: "Drama", isDeleted: false },
    { name: "Discovery", isDeleted: false },
    { name: "Teen Adventure Week", isDeleted: false },
    { name: "Learning Center", isDeleted: false },
    { name: "Music", isDeleted: false },
    { name: "Outdoor Cooking", isDeleted: false },
    { name: "Small Animals", isDeleted: false },
    { name: "Xplore!", isDeleted: false },
    { name: "Teens", isDeleted: false },
    { name: "Waterfront", isDeleted: false }
  ];

  for(let i = 0; i < totalActivities; i++)
  {
    const name: string = Math.random().toString(36).slice(2);
    const description: string = Math.random().toString(36).slice(2);
    const programArea: ProgramArea = possibleProgramAreas[Math.floor(Math.random()*possibleProgramAreas.length)];
    const ageGroup: AgeGroup = Math.random() < 0.5 ? "NAV" : "OCP";

    activities.push({
      name: name,
      description: description,
      programArea: programArea,
      ageGroup: ageGroup,
      assignments: {
        camperIds: [],
        staffIds: [],
        adminIds: []
      }
    });
  }

  return activities;

  
}

function generateCamperPrefs(campers: CamperAttendeeID[], schedule: SectionSchedule<'BUNDLE'>): SectionPreferences {
  const sectionPrefs: SectionPreferences = {};

  for (const blockId in schedule.blocks) {
    sectionPrefs[blockId] = {};

    const block = schedule.blocks[blockId];
    const activities = block.activities;

    campers.forEach(camper => {

      // Randomly choose 5 activities
      const chosen = activities.sort(() => Math.random() - 0.5).slice(0, 5);

      const activityRankings: { [activityId: string]: number } = {};
      chosen.forEach((a, index) => {
        activityRankings[a.name] = index + 1;
      });

      sectionPrefs[blockId][camper.id] = activityRankings;
    });
  }

  return sectionPrefs;
}

function generateBundleSchedule() {
  const campers: CamperAttendeeID[] = generateCampers(20, 5);
  const staff: StaffAttendeeID[] = generateStaff(20, 5);
  const admins: AdminAttendeeID[] = generateAdmins(10);
  const bundleNum: number = 3;
  const blocksToAssign: string[] = generateBlockIDs(5);
  const activitiesToAssign: BundleBlockActivities = generateActivities(7);
  const schedule: SectionSchedule<'BUNDLE'> = generateBlockSchedule(blocksToAssign);
  const camperPrefs: SectionPreferences = generateCamperPrefs(campers, schedule);

  const scheduler = new BundleScheduler()
  .withBundleNum(bundleNum)
  .withSchedule(schedule)
  .withCampers(campers)
  .withStaff(staff)
  .withAdmins(admins)
  .withCampersPrefs(camperPrefs)
  .forBlocks(blocksToAssign);

  return scheduler;
}

async function main()
{
  const bundleSchedule = generateBundleSchedule();
}