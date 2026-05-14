import { faker } from "@faker-js/faker";
import { Admin, Camper, Gender, Name, Parent, Photographer, Staff } from "@/types/users/userTypes";
import { Album } from "@/types/albums/albumTypes";
import { CommonSection, SchedulingSection, Section, Session } from "@/types/sessions/sessionTypes";
import { BundleActivity, BundleActivityWithAssignments, BundleBlock, BundleSectionSchedule, BunkJamboreeActivityWithAssignments, BunkJamboreeBlock, BunkJamboreeSectionSchedule, JamboreeActivity, NonBunkJamboreeActivityWithAssignments, NonBunkJamboreeBlock, NonBunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypes";
import moment from "moment";

export function resetFaker() {
  faker.seed(0);
}

function generateGender(): Gender {
  const rng = faker.number.float()
  return rng < 0.02 ? 'Other' : rng < 0.51 ? 'Male' : 'Female'
}

function generateName(): Name {
  const firstName = faker.person.firstName();
  const middleName = faker.number.float() < 0.5 ? faker.person.middleName() : undefined;
  const lastName = faker.person.lastName();
  return middleName ? { firstName, middleName, lastName } : { firstName, lastName }
}

export function generateAdmin(): Admin {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: generateName(),
    role: "ADMIN",
    gender: generateGender(),
    email: faker.internet.email(),
    dateOfBirth: faker.date.birthdate({ mode: 'age', min: 18, max: 60 }).toISOString(),
    uid: faker.string.alphanumeric(28),
    nonoListIds: [],
    yesyesListIds: []
  }
}

export function generateStaff(): Staff {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: generateName(),
    role: "STAFF",
    gender: generateGender(),
    email: faker.internet.email(),
    dateOfBirth: faker.date.birthdate({ mode: 'age', min: 18, max: 60 }).toISOString(),
    uid: faker.string.alphanumeric(28),
    nonoListIds: [],
    yesyesListIds: []
  }
}

export function generateCamper(): Camper {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: generateName(),
    role: "CAMPER",
    dateOfBirth: faker.date.birthdate({ mode: 'age', min: 7, max: 18 }).toISOString(),
    gender: generateGender(),
    ...(faker.datatype.boolean() ? { email: faker.internet.email() } : {}),
    uid: faker.string.alphanumeric(28),
    nonoListIds: [],
    parentIds: [],
    photoPermissions: faker.number.float() < 0.5 ? "PUBLIC" : "PRIVATE"
  }
}

export function generateParent(): Parent {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: generateName(),
    dateOfBirth: faker.date.birthdate({ mode: 'age', min: 25, max: 60 }).toISOString(),
    role: "PARENT",
    gender: generateGender(),
    email: faker.internet.email(),
    uid: faker.string.alphanumeric(28),
    camperIds: []
  }
}

export function generatePhotographer(): Photographer {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: generateName(),
    role: "PHOTOGRAPHER",
    dateOfBirth: faker.date.birthdate({ mode: 'age', min: 18, max: 60 }).toISOString(),
    gender: generateGender(),
    email: faker.internet.email(),
    uid: faker.string.alphanumeric(28),
  }
}

export function generateFamily() {

}

export function generateAlbum(): Album {
  return {} as Album;
}

export function generateSession(): Session {
  const sessionLength = faker.number.int({ min: 5, max: 14 });
  const startDate = faker.date.future();
  const endDate = moment(startDate).add(sessionLength, 'days');

  return {
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    startDate: moment(startDate),
    endDate: moment(endDate),
    driveFolderId: '',
  }
}

export function generateSections(session: Session): Section[] {
  const sections: Section[] = [];
  const startDate = moment(session.startDate);
  const endDate = moment(session.endDate);

  const openingSection: CommonSection = {
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    type: "COMMON",
    sessionId: session.id,
    startDate: startDate,
    endDate: startDate.clone().add(1, 'day')
  }

  const endingSection: CommonSection = {
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    type: "COMMON",
    sessionId: session.id,
    startDate: endDate.clone().subtract(1, 'day'),
    endDate: endDate
  }

  let currDate = startDate.clone().add(1, 'day');
  const dayBeforeLast = endDate.clone().subtract(1, 'day')
  while (currDate.isBefore(dayBeforeLast)) {
    const daysLeft = dayBeforeLast.diff(currDate, 'days');
    if (Math.floor(daysLeft / 4) >= 1) {
      sections.push({
        id: faker.string.uuid(),
        name: faker.lorem.words({ min: 2, max: 5 }),
        type: "BUNDLE",
        sessionId: session.id,
        startDate: currDate,
        endDate: currDate.clone().add(3, 'days'),
      } satisfies SchedulingSection);
      sections.push({
        id: faker.string.uuid(),
        name: faker.lorem.words({ min: 2, max: 5 }),
        type: faker.datatype.boolean() ? "BUNK-JAMBO" : "NON-BUNK-JAMBO",
        sessionId: session.id,
        startDate: currDate,
        endDate: currDate.clone().add(3, 'days'),
      } satisfies SchedulingSection);
      currDate.add(4, 'days')
      continue;
    }
    for (let i = 0; i < daysLeft; i++) {
      sections.push({
        id: faker.string.uuid(),
        name: faker.lorem.words({ min: 2, max: 5 }),
        type: faker.datatype.boolean() ? "BUNK-JAMBO" : "NON-BUNK-JAMBO",
        sessionId: session.id,
        startDate: currDate,
        endDate: currDate.clone().add(3, 'days'),
      } satisfies SchedulingSection)
    }
    currDate.add(daysLeft, 'days');
  }

  return [openingSection, ...sections, endingSection];
}

const ALL_PROGRAM_AREAS = {
  "ACT": "Activate",
  "A&C": "Arts & Crafts",
  "ATH": "Athletics",
  "BOAT": "Boating",
  "CHAL": "Challenge",
  "DNC": "Dance",
  "DRA": "Drama",
  "DISC": "Discovery",
  "LC": "Learning Center",
  "MUS": "Music",
  "OUT": "Outdoor Cooking",
  "SMA": "Small Animals",
  "XPL": "Xplore!",
  "OCP": "Teens",
  "WF": "Waterfront"
}

export function generateBundleActivities(): BundleActivityWithAssignments[] {
  return Object.keys(ALL_PROGRAM_AREAS).flatMap((programArea) => ({
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.words({ min: 5, max: 20 }),
    programAreaId: programArea,
    ageGroup: faker.datatype.boolean() ? "NAV" : "OCP",
    adminIds: [],
    staffIds: [],
    camperIds: []
  }) satisfies BundleActivityWithAssignments)
}

export function generateBundleBlock(): BundleBlock {
  return {
    activities: generateBundleActivities(),
    periodsOff: [],
  }
}

export function generateBundleSchedule(section: SchedulingSection): BundleSectionSchedule {
  return {
    sessionId: section.sessionId,
    sectionId: section.id,
    type: "BUNDLE",
    blocks: {
      "A": generateBundleBlock(),
      "B": generateBundleBlock(),
      "C": generateBundleBlock(),
      "D": generateBundleBlock(),
      "E": generateBundleBlock(),
    },
    alternatePeriodsOff: {},
  }
}

export function generateBunkJamboreeActivities(): BunkJamboreeActivityWithAssignments[] {
  return Object.keys(ALL_PROGRAM_AREAS).flatMap((programArea) => ({
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.words({ min: 5, max: 20 }),
    adminIds: [],
    bunkNums: []
  }) satisfies BunkJamboreeActivityWithAssignments)
}

export function generateBunkJamboreeBlock(): BunkJamboreeBlock {
  return {
    activities: generateBunkJamboreeActivities(),
    periodsOff: [],
  }
}

export function generateNonBunkJamboreeActivities(): NonBunkJamboreeActivityWithAssignments[] {
  return Object.keys(ALL_PROGRAM_AREAS).flatMap((programArea) => ({
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.words({ min: 5, max: 20 }),
    adminIds: [],
    staffIds: [],
    camperIds: []
  }) satisfies NonBunkJamboreeActivityWithAssignments)
}

export function generateNonBunkJamboreeBlock(): NonBunkJamboreeBlock {
  return {
    activities: generateNonBunkJamboreeActivities(),
    periodsOff: [],
  }
}

export function generateBunkJamboreeSchedule(section: SchedulingSection): BunkJamboreeSectionSchedule {
  return {
    sessionId: section.sessionId,
    sectionId: section.id,
    type: "BUNK-JAMBO",
    blocks: {
      "A": generateBunkJamboreeBlock(),
      "B": generateBunkJamboreeBlock(),
      "C": generateBunkJamboreeBlock(),
      "D": generateBunkJamboreeBlock(),
      "E": generateBunkJamboreeBlock(),
    },
    alternatePeriodsOff: {},
  }
}

export function generateNonBunkJamboreeSchedule(section: SchedulingSection): NonBunkJamboreeSectionSchedule {
  return {
    sessionId: section.sessionId,
    sectionId: section.id,
    type: "NON-BUNK-JAMBO",
    blocks: {
      "A": generateNonBunkJamboreeBlock(),
      "B": generateNonBunkJamboreeBlock(),
      "C": generateNonBunkJamboreeBlock(),
      "D": generateNonBunkJamboreeBlock(),
      "E": generateNonBunkJamboreeBlock(),
    },
    alternatePeriodsOff: {},
  }
}