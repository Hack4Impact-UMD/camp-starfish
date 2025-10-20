import { db, storage } from "@/config/firebase"; // your config file
import { doc, setDoc } from "firebase/firestore";
import { BundleScheduler, } from "../BundleScheduler";
import { CamperAttendeeID, StaffAttendeeID, AdminAttendeeID, AgeGroup, SectionSchedule, BundleBlockActivities, 
  ProgramArea, SectionPreferences, BunkID, BunkJamboreeBlockActivities,NonBunkJamboreeBlockActivities, Freeplay, 
  PostID, Bunk, SectionID, SessionID, NightShiftID, 
  SectionScheduleID} from "@/types/sessionTypes";
import { Camper } from "@/types/personTypes";
import { BunkJamboreeScheduler } from "../BunkJamboreeScheduler";
import { NonBunkJamboreeScheduler } from "../NonBunkJamboreeScheduler";
import { FreeplayScheduler } from "../FreeplayScheduler";
import { SessionScheduler } from "../SessionScheduler";
// import { S } from "framer-motion/dist/types.d-B50aGbjN";
import moment from "moment";


/* GENERATE ATTENDEES */ 
function generateCampers(totalCampers: number, numberBunks: number): CamperAttendeeID[] {
  const campers: CamperAttendeeID[] = [];

  const currentYear = moment().year();

  for (let i = 0; i < totalCampers; i++) {
    const id = Math.floor(Math.random() * 1000) + 1;
    const name = {
      firstName: Math.random().toString(36).slice(2),
      middleName: Math.random().toString(36).slice(2),
      lastName: Math.random().toString(36).slice(2),
    };

    const gender = Math.random() < 0.5 ? "Male" : "Female";

    // Random DOB using moment
    const birthDate = moment()
      .year(currentYear - 7 - Math.floor(Math.random() * 12)) // between 7 and 18 years old
      .month(Math.floor(Math.random() * 12))
      .date(Math.floor(Math.random() * 28) + 1);
    const dateOfBirth = birthDate.toISOString();

    const age = currentYear - birthDate.year();
    const ageGroup: AgeGroup = age >= 14 ? "OCP" : "NAV";

    const level = Math.floor(Math.random() * 5) + 1;
    const bunk = (i % numberBunks) + 1;

    let swimOptOut = false;
    if (ageGroup === "OCP" && level > 4) {
      swimOptOut = Math.random() < 0.5;
    }

    campers.push({
      id,
      name,
      gender,
      dateOfBirth,
      nonoList: [],
      role: "CAMPER",
      ageGroup,
      level,
      bunk,
      swimOptOut,
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
    const bunk = (i % numberBunks) + 1;
    const leadBunkCounselor = Math.floor(i / numberBunks) === 0;

    staff.push({
      id,
      name,
      gender,
      nonoList: [],
      yesyesList: [],
      role: "STAFF",
      bunk,
      leadBunkCounselor,
      daysOff: [],
      sessionId: "session1",
    });
  }

  return staff;
}

function generateAdmins(totalAdmins: number): AdminAttendeeID[] {
  const admins: AdminAttendeeID[] = [];

  for (let i = 0; i < totalAdmins; i++) {
    const id = Math.floor(Math.random() * 1000) + 1;
    const name = {
      firstName: Math.random().toString(36).slice(2),
      middleName: Math.random().toString(36).slice(2),
      lastName: Math.random().toString(36).slice(2),
    };

    const gender = Math.random() < 0.5 ? "Male" : "Female";

    admins.push({
      id,
      name,
      gender,
      nonoList: [],
      yesyesList: [],
      role: "ADMIN",
      daysOff: [],
      sessionId: "session1",
    });
  }

  return admins;
}


function generateNonoLists(campers: CamperAttendeeID[], staff: StaffAttendeeID[], admins: AdminAttendeeID[]) {
  const allPeople = [...campers, ...staff, ...admins];

  for (const camper of campers) {

    // Shuffle the array to pick random people
    const shuffled = allPeople
      .filter(p => p.id !== camper.id) // avoid themselves
      .sort(() => Math.random() - 0.5);

    // Pick 3 random people and save nonoList as an array of their IDs
    const randomAmount = Math.floor(Math.random() * 4);   
    const selected = shuffled.slice(0, randomAmount);
    camper.nonoList = selected.map(p => p.id);

    // Add camper to each selected person's nonoList
    for (const person of selected) {
      if (!person.nonoList.includes(camper.id)) {
        person.nonoList.push(camper.id);
      }
    }
  }

  for (const staffer of staff) {

    // Shuffle the array to pick random people
    const shuffled = allPeople
      .filter(p => p.id !== staffer.id) // avoid themselves
      .sort(() => Math.random() - 0.5);

    // Pick 3 random people and save nonoList as an array of their IDs
    const randomAmount = Math.floor(Math.random() * 4);   
    const selected = shuffled.slice(0, randomAmount);
    staffer.nonoList = selected.map(p => p.id);

    // Add camper to each selected person's nonoList
    for (const person of selected) {
      if (!person.nonoList.includes(staffer.id)) {
        person.nonoList.push(staffer.id);
      }
    }
  }

  for (const admin of admins) {

    // Shuffle the array to pick random people
    const shuffled = allPeople
      .filter(p => p.id !== admin.id) // avoid themselves
      .sort(() => Math.random() - 0.5);

    // Pick 3 random people and save nonoList as an array of their IDs
    const randomAmount = Math.floor(Math.random() * 4);   
    const selected = shuffled.slice(0, randomAmount);
    admin.nonoList = selected.map(p => p.id);

    // Add camper to each selected person's nonoList
    for (const person of selected) {
      if (!person.nonoList.includes(admin.id)) {
        person.nonoList.push(admin.id);
      }
    }
  }
}

function generateYesyesLists(staff: StaffAttendeeID[], admins: AdminAttendeeID[]) {
  const allPeople = [...staff, ...admins];

  function pickRandom(person: StaffAttendeeID | AdminAttendeeID) {
    const possible = allPeople.filter(
      p =>
        p.id !== person.id && 
        !(person.nonoList?.includes(p.id)) && p.yesyesList.length === 0
    );

    if (possible.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * possible.length);
    return possible[randomIndex].id;
  }

  for (const person of allPeople) {
    if (person.yesyesList.length > 0) continue;

    const selectedId = pickRandom(person);
    if (selectedId !== null) {
      const selectedPerson = allPeople.find(p => p.id === selectedId)!;

      if (selectedPerson.yesyesList.length === 0) {
        person.yesyesList.push(selectedId);
        selectedPerson.yesyesList.push(person.id);
      }
    }
  }
}

function generateBunks(totalBunks: number, campers: CamperAttendeeID[], staff: StaffAttendeeID[]): BunkID[] {
  const bunks: BunkID[] = [];

  for (let i = 0; i < totalBunks; i++) {
    bunks.push({
      leadCounselor: 0,
      staffIds: [],
      camperIds: [],
      sessionId: "session1",
      id: i + 1

    });
  }

  for (const staffer of staff) {
    const bunkIndex = staffer.bunk - 1;
    if (staffer.leadBunkCounselor) {
      bunks[bunkIndex].leadCounselor = staffer.id;
      bunks[bunkIndex].staffIds.push(staffer.id);
    }
  }

  for (const staffer of staff) {
    if (!staffer.leadBunkCounselor) {
      const bunkIndex = staffer.bunk - 1; 
      bunks[bunkIndex].staffIds.push(staffer.id);
    }
  }

  for (const camper of campers) {
    const bunkIndex = camper.bunk - 1;
    bunks[bunkIndex].camperIds.push(camper.id);
  }



  return bunks;
}

function generateProgramCounselors(
  staff: StaffAttendeeID[], 
  schedule: SectionSchedule<"BUNDLE">
) {
  const assignedStaff = new Set<number>();

  for (const blockId in schedule.blocks) {
    const block = schedule.blocks[blockId];

    for (const activity of block.activities) {
      const availableStaff = staff.filter(s => !assignedStaff.has(s.id));

      if (availableStaff.length === 0) {
        console.warn("No available staff left to assign!");
        continue; // skip if no staff are left
      }

      const randomStaff = availableStaff[Math.floor(Math.random() * availableStaff.length)];

      randomStaff.programCounselor = activity.programArea;

      assignedStaff.add(randomStaff.id);
    }
  }
}


/* BLOCK SCHEDULES */

function generateBundleBlockSchedule(blockIDs: string[]) {

  const schedule: SectionSchedule<'BUNDLE'> = { blocks: {}, alternatePeriodsOff: {} };


  for(let i = 0; i < blockIDs.length; i++)
  {
    const activities: BundleBlockActivities = generateBundleActivities(7, blockIDs[i]);
    const periodsOff: number[] = [];
    schedule.blocks[blockIDs[i]] = { activities: activities, periodsOff: periodsOff };
  }

  return schedule;

}

function generateBunkJamboBlockSchedule(blockIDs: string[]) {

  const schedule: SectionSchedule<'BUNK-JAMBO'> = { blocks: {}, alternatePeriodsOff: {} };


  for(let i = 0; i < blockIDs.length; i++)
  {
    const activities: BunkJamboreeBlockActivities = generateBunkJamboActivities(7, blockIDs[i]);
    const periodsOff: number[] = [];
    schedule.blocks[blockIDs[i]] = { activities: activities, periodsOff: periodsOff };
  }

  return schedule;

}

function generateNonBunkJamboBlockSchedule(blockIDs: string[]) {

  const schedule: SectionSchedule<'NON-BUNK-JAMBO'> = { blocks: {}, alternatePeriodsOff: {} };


  for(let i = 0; i < blockIDs.length; i++)
  {
    const activities: NonBunkJamboreeBlockActivities = generateNonBunkJamboActivities(7, blockIDs[i]);
    const periodsOff: number[] = [];
    schedule.blocks[blockIDs[i]] = { activities: activities, periodsOff: periodsOff };
  }

  return schedule;

}

function generateFreeplayBlockSchedule(posts: PostID[]) : Freeplay {

  const schedule: Freeplay = { posts: {}, buddies: {} };


  for(let i = 0; i < posts.length; i++)
  {
    const buddies: number[] = [];
    schedule.posts[posts[i].id] = buddies;
  }

  return schedule
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

/* GENERATE ACTIVITIES */
function generateBundleActivities(totalActivities: number, blockID: string): BundleBlockActivities {
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
    { name: "Waterfront", isDeleted: false },
  ];

  let hasAddedWaterfrontOCP = false;
  let hasAddedWaterfrontNAV = false;


  for (let i = 0; i < totalActivities; i++) {
    let name: string;
    let description: string;
    let programArea: ProgramArea;
    let ageGroup: AgeGroup;

    // If blockID is "A" or "B" and we haven't added Waterfront to OCP yet, add it
    if ((blockID === "A" || blockID === "B") && !hasAddedWaterfrontOCP) {
      programArea = possibleProgramAreas.find(p => p.name === "Waterfront")!;
      name = "Swim-I";
      description = "OCP Waterfront Activity";
      ageGroup = "OCP";
      hasAddedWaterfrontOCP = true;
    } 
   
    // If blockID is "C", "D", or "E" and we haven't added Waterfront to OCP yet, add it
    else if ((blockID === "C" || blockID === "D"|| blockID === "E") && !hasAddedWaterfrontNAV) {
      programArea = possibleProgramAreas.find(p => p.name === "Waterfront")!;
      name = "Swim-I";
      description = "NAV Waterfront Activity";
      ageGroup = "NAV";
      hasAddedWaterfrontNAV = true;
    } 
    else {
      name = Math.random().toString(36).slice(2);
      description = Math.random().toString(36).slice(2);
      const filteredProgramAreas = possibleProgramAreas.filter(p => p.name !== "Waterfront");
      programArea = filteredProgramAreas[Math.floor(Math.random() * filteredProgramAreas.length)];
      ageGroup = Math.random() < 0.5 ? "NAV" : "OCP";
    }

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

function generateBunkJamboActivities(totalActivities: number, blockID: string): BunkJamboreeBlockActivities {
  const activities: BunkJamboreeBlockActivities = [];

  for (let i = 0; i < totalActivities; i++) {
    let name: string;
    let description: string;

    name = Math.random().toString(36).slice(2);
    description = Math.random().toString(36).slice(2);


    activities.push({
      name: name,
      description: description,

      assignments: {
        bunk: -1,
        adminIds: []
      }
    });
  }

  return activities;

}

function generateNonBunkJamboActivities(totalActivities: number, blockID: string): NonBunkJamboreeBlockActivities {

  const activities: NonBunkJamboreeBlockActivities = [];

  for (let i = 0; i < totalActivities; i++) {
    let name: string;
    let description: string;

    name = Math.random().toString(36).slice(2);
    description = Math.random().toString(36).slice(2);


    activities.push({
      name: name,
      description: description,
      assignments: {
        camperIds: [],
        staffIds: [],
        adminIds: []
      }
    });
  }

  return activities;
}

function generatePosts(totalPosts: number): PostID[] {

  const posts: PostID[] = [];

  for (let i = 0; i < totalPosts; i++) {
    let name: string;
    let requiresAdmin: boolean;

    name = Math.random().toString(36).slice(2);
    requiresAdmin = Math.random() < 0.5 ? true : false;

    posts.push({
      name: name,
      requiresAdmin: requiresAdmin,
      id: name
    });
  }

  return posts;
  
}
  



/* GENERATE PREFERENCES */
function generatePrefs(assignees: CamperAttendeeID[] | BunkID[], schedule: SectionSchedule<'BUNDLE' | 'NON-BUNK-JAMBO' | 'BUNK-JAMBO'>): SectionPreferences {
  const sectionPrefs: SectionPreferences = {};

  for (const blockId in schedule.blocks) {
    sectionPrefs[blockId] = {};

    const block = schedule.blocks[blockId];
    const activities = block.activities;

    assignees.forEach(assignee => {

      // Randomly choose 5 activities
      const chosen = activities.sort(() => Math.random() - 0.5).slice(0, 5);

      const activityRankings: { [activityId: string]: number } = {};
      chosen.forEach((a, index) => {
        activityRankings[a.name] = index + 1;
      });

      sectionPrefs[blockId][assignee.id] = activityRankings;
    });
  }

  return sectionPrefs;
}

/* GENERATE SCHEDULES */
export function generateBundleSchedule(numBlocks: number, bundleNum: number, campers: CamperAttendeeID[], staff: StaffAttendeeID[], admins: AdminAttendeeID[]){

  const blocksToAssign: string[] = generateBlockIDs(5);
  const schedule: SectionSchedule<'BUNDLE'> = generateBundleBlockSchedule(blocksToAssign);
  const camperPrefs: SectionPreferences = generatePrefs(campers, schedule);
  generateProgramCounselors(staff, schedule);
  generateNonoLists(campers, staff, admins);
  generateYesyesLists(staff, admins);

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

export function generateBunkJamboreeSchedule(numBlocks: number, campers: CamperAttendeeID[], staff: StaffAttendeeID[], admins: AdminAttendeeID[]) {
  const blocksToAssign: string[] = generateBlockIDs(numBlocks);
  const schedule: SectionSchedule<'BUNK-JAMBO'> = generateBunkJamboBlockSchedule(blocksToAssign);
  generateNonoLists(campers, staff, admins);
  generateYesyesLists(staff, admins);

  const bunks: BunkID[] = generateBunks(5, campers, staff);
  const preferences: SectionPreferences = generatePrefs(bunks, schedule);


  const scheduler = new BunkJamboreeScheduler()
  .withSchedule(schedule)
  .withAdmins(admins)
  .forBlocks(blocksToAssign)
  .withBunks(bunks)
  .withPreferences(preferences);

  return scheduler;
}

export function generateNonBunkJamboreeSchedule(numBlocks:number, campers: CamperAttendeeID[], staff: StaffAttendeeID[], admins: AdminAttendeeID[]) {
  const blocksToAssign: string[] = generateBlockIDs(numBlocks);
  const schedule: SectionSchedule<'NON-BUNK-JAMBO'> = generateNonBunkJamboBlockSchedule(blocksToAssign);
  const camperPrefs: SectionPreferences = generatePrefs(campers, schedule);
  generateNonoLists(campers, staff, admins);
  generateYesyesLists(staff, admins);

  const scheduler = new NonBunkJamboreeScheduler()
  .withSchedule(schedule)
  .withCampers(campers)
  .withStaff(staff)
  .withAdmins(admins)
  .withCamperPrefs(camperPrefs)
  .forBlocks(blocksToAssign);

  return scheduler;
}

export function generateFreeplaySchedule(campers: CamperAttendeeID[], staff: StaffAttendeeID[], admins: AdminAttendeeID[])
{

  const posts: PostID[] = generatePosts(10);
  const schedule: Freeplay= generateFreeplayBlockSchedule(posts);

  const scheduler = new FreeplayScheduler()
  .withSchedule(schedule)
  .withCampers(campers)
  .withStaff(staff)
  .withAdmins(admins)

  return scheduler
}

export function generateSession() {
  const startDate = moment().startOf("month");
  const endDate = startDate.clone().add(2, "weeks");

  const campers: CamperAttendeeID[] = generateCampers(40, 5);
  const staff: StaffAttendeeID[] = generateStaff(40, 5);
  const admins: AdminAttendeeID[] = generateAdmins(10);

  const session: SessionID = {
    id: "session1",
    name: "Session 1",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    driveFolderId: "1",
  };

  const sections: SectionID[] = [
    {
      id: "Opening-Day",
      sessionId: session.id,
      name: "Opening Day",
      type: "COMMON",
      startDate: startDate.toISOString(),
      endDate: startDate.clone().add(1, "days").toISOString(),
    },
    {
      id: "Bundle-1",
      sessionId: session.id,
      name: "Bundle 1",
      type: "BUNDLE",
      startDate: startDate.clone().add(1, "days").toISOString(),
      endDate: startDate.clone().add(4, "days").toISOString(),
      numBlocks: 5
    },
    {
      id: "Jamboree-1",
      sessionId: session.id,
      name: "Bunk Jamboree 1",
      type: "BUNK-JAMBO",
      startDate: moment(session.startDate).add(4, "days").toISOString(),
      endDate: moment(session.startDate).add(5, "days").toISOString(),
      numBlocks: 5,
    },
    {
      id: "Bundle-2",
      sessionId: session.id,
      name: "Bundle 2",
      type: "BUNDLE",
      startDate: moment(session.startDate).add(5, "days").toISOString(),
      endDate: moment(session.startDate).add(8, "days").toISOString(),
      numBlocks: 5,
    },
    {
      id: "Jamboree-2",
      sessionId: session.id,
      name: "Nonbunk Jamboree 2",
      type: "NON-BUNK-JAMBO",
      startDate: moment(session.startDate).add(8, "days").toISOString(),
      endDate: moment(session.startDate).add(9, "days").toISOString(),
      numBlocks: 5,
    },
    {
      id: "Bundle-3",
      sessionId: session.id,
      name: "Bundle 3",
      type: "BUNDLE",
      startDate: moment(session.startDate).add(9, "days").toISOString(),
      endDate: moment(session.startDate).add(12, "days").toISOString(),
      numBlocks: 5,
    },
    {
      id: "Tag-Up",
      sessionId: session.id,
      name: "Tag Up",
      type: "COMMON",
      startDate: moment(session.startDate).add(12, "days").toISOString(),
      endDate: moment(session.startDate).add(13, "days").toISOString(),
    },
    {
      id: "Visitors-Day",
      sessionId: session.id,
      name: "Visitor's Day",
      type: "COMMON",
      startDate: moment(session.startDate).add(13, "days").toISOString(),
      endDate: moment(session.startDate).add(14, "days").toISOString(),
    },
  ];

  const counselors: (StaffAttendeeID | AdminAttendeeID)[] = [...staff, ...admins];
  const nightShifts: NightShiftID[] = [];

  const sessionScheduler = new SessionScheduler()
    .withSession(session)
    .withSections(sections)
    .withCounselors(counselors)
    .withNightShifts(nightShifts);

  const bundleScheduler1 = generateBundleSchedule(5, 1, campers, staff, admins);
  const bundleScheduler2 = generateBundleSchedule(5, 2, campers, staff, admins);
  const bundleScheduler3 = generateBundleSchedule(5, 3, campers, staff, admins);
  const bunkJamboreeScheduler = generateBunkJamboreeSchedule(5, campers, staff, admins);
  const nonBunkJamboreeScheduler = generateNonBunkJamboreeSchedule(5, campers, staff, admins);
  const freeplayScheduler = generateFreeplaySchedule(campers, staff, admins);

  return {
    sessionScheduler,
    bundleScheduler1,
    bundleScheduler2,
    bundleScheduler3,
    bunkJamboreeScheduler,
    nonBunkJamboreeScheduler,
    freeplayScheduler
  };
}

/*
// Push to emulator
export async function pushSessionToEmulator() {
  const {
    sessionScheduler,
    bundleScheduler1,
    bundleScheduler2,
    bundleScheduler3,
    bunkJamboreeScheduler,
    nonBunkJamboreeScheduler,
    freeplayScheduler,
  } = generateSession();

  const session = sessionScheduler.session;
  if (!session) return;

  // Save session doc
  await setDoc(doc(db, "sessions", session.id), session);

  const sessionRef = doc(db, "sessions", session.id);

  // Save attendees under attendees subcollection
  for (const camper of bundleScheduler1.campers) {
    await setDoc(doc(db, `sessions/${session.id}/attendees`, camper.id.toString()), camper);
  }
  for (const staff of bundleScheduler1.staff) {
    await setDoc(doc(db, `sessions/${session.id}/attendees`, staff.id.toString()), staff);
  }
  for (const admin of bundleScheduler1.admins) {
    await setDoc(doc(db, `sessions/${session.id}/attendees`, admin.id.toString()), admin);
  }

  // Save sections
  for (const section of sessionScheduler.sections) {
    await setDoc(doc(db, `sessions/${session.id}/sections`, section.id), section);

    // For each section, save its schedule as a subcollection
    const sectionRef = doc(db, `sessions/${session.id}/sections`, section.id);

    // Example for Bundle-1
    if (section.id === "Bundle-1") {
      const bundle1: SectionScheduleID<"BUNDLE"> = {
        blocks: bundleScheduler1.schedule.blocks,
        alternatePeriodsOff: bundleScheduler1.schedule.alternatePeriodsOff,
        sessionId: session.id,
        sectionId: section.id,
        id: section.id + "-schedule",
      };

      await setDoc(doc(db, `sessions/${session.id}/sections/${section.id}/schedule`, bundle1.id), bundle1);
    }

    // Example for Bundle-2
    if (section.id === "Bundle-2") {
      const bundle2: SectionScheduleID<"BUNDLE"> = {
        blocks: bundleScheduler2.schedule.blocks,
        alternatePeriodsOff: bundleScheduler2.schedule.alternatePeriodsOff,
        sessionId: session.id,
        sectionId: section.id,
        id: section.id + "-schedule",
      };

      await setDoc(doc(db, `sessions/${session.id}/sections/${section.id}/schedule`, bundle2.id), bundle2);
    }

    // Example for Bundle-3
    if (section.id === "Bundle-3") {
      const bundle3: SectionScheduleID<"BUNDLE"> = {
        blocks: bundleScheduler3.schedule.blocks,
        alternatePeriodsOff: bundleScheduler3.schedule.alternatePeriodsOff,
        sessionId: session.id,
        sectionId: section.id,
        id: section.id + "-schedule",
      };

      await setDoc(doc(db, `sessions/${session.id}/sections/${section.id}/schedule`, bundle3.id), bundle3);
    }

    // Example for Jamboree-1
    if (section.id === "Jamboree-1") {
      const bunkjambo: SectionScheduleID<'BUNK-JAMBO'> = {
        blocks: bunkJamboreeScheduler.schedule.blocks,
        alternatePeriodsOff: bunkJamboreeScheduler.schedule.alternatePeriodsOff,
        sessionId: session.id,
        sectionId: section.id,
        id: section.id + "-schedule",
      };

      await setDoc(doc(db, `sessions/${session.id}/sections/${section.id}/schedule`, bunkjambo.id), bunkjambo);
    }

    
    // Example for Jamboree-2
    if (section.id === "Jamboree-2") {
      const nonbunkjambo: SectionScheduleID<'NON-BUNK-JAMBO'> = {
        blocks: nonBunkJamboreeScheduler.schedule.blocks, 
        alternatePeriodsOff: nonBunkJamboreeScheduler.schedule.alternatePeriodsOff,
        sessionId: session.id,
        sectionId: section.id,
        id: section.id + "-schedule",
      };

      await setDoc(doc(db, `sessions/${session.id}/sections/${section.id}/schedule`, nonbunkjambo.id), nonbunkjambo);
    }

    // Repeat similar logic for other sections (Bundle-2, Bunk Jamboree, etc.)
  }

  // Save bunks
  for (const bunk of bunkJamboreeScheduler.bunks) {
    await setDoc(doc(db, `sessions/${session.id}/bunks`, bunk.id.toString()), bunk);
  }

  if (sessionScheduler.nightShifts.length === 0) {
    const emptyNightShift = { placeholder: true }; 
    await setDoc(doc(db, `sessions/${session.id}/night_shifts/placeholder`), emptyNightShift);
  }

  for (const nightShift of sessionScheduler.nightShifts) {
    await setDoc(doc(db, `sessions/${session.id}/night_shifts`, nightShift.id), nightShift);
  }

  // Save freeplays 
  for (const postId of Object.keys(freeplayScheduler.schedule.posts)) {
    const freeplay = freeplayScheduler.schedule.posts[postId];
    await setDoc(doc(db, `sessions/${session.id}/freeplays`, postId), {
      postId,
      buddies: freeplay
    });
  }

}
*/