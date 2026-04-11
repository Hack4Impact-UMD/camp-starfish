import { faker } from "@faker-js/faker";
import { Admin, Camper, Gender, Parent, Photographer, Staff } from "@/types/users/userTypes";
import { Album } from "@/types/albums/albumTypes";
import { CommonSection, SchedulingSection, Section, Session } from "@/types/sessions/sessionTypes";
import moment from "moment";

export function resetFaker() {
  faker.seed(0);
}

function generateGender(): Gender {
  const rng = faker.number.float()
  return rng < 0.02 ? 'Other' : rng < 0.51 ? 'Male' : 'Female'
}

export function generateAdmin(): Admin {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: {
      firstName: faker.person.firstName(),
      middleName: faker.number.float() < 0.5 ? faker.person.middleName() : undefined,
      lastName: faker.person.lastName(),
    },
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
    name: {
      firstName: faker.person.firstName(),
      middleName: faker.number.float() < 0.5 ? faker.person.middleName() : undefined,
      lastName: faker.person.lastName(),
    },
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
    name: {
      firstName: faker.person.firstName(),
      middleName: faker.number.float() < 0.5 ? faker.person.middleName() : undefined,
      lastName: faker.person.lastName(),
    },
    role: "CAMPER",
    dateOfBirth: faker.date.birthdate({ mode: 'age', min: 7, max: 18 }).toISOString(),
    gender: generateGender(),
    email: faker.number.float() < 0.5 ? faker.internet.email() : undefined,
    uid: faker.string.alphanumeric(28),
    nonoListIds: [],
    parentIds: [],
    photoPermissions: faker.number.float() < 0.5 ? "PUBLIC" : "PRIVATE"
  }
}

export function generateParent(): Parent {
  return {
    id: faker.number.int({ min: 10000000, max: 99999999 }),
    name: {
      firstName: faker.person.firstName(),
      middleName: faker.number.float() < 0.5 ? faker.person.middleName() : undefined,
      lastName: faker.person.lastName(),
    },
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
    name: {
      firstName: faker.person.firstName(),
      middleName: faker.number.float() < 0.5 ? faker.person.middleName() : undefined,
      lastName: faker.person.lastName(),
    },
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
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
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
    startDate: startDate.toISOString(),
    endDate: startDate.clone().add(1, 'day').toISOString()
  }

  const endingSection: CommonSection = {
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 2, max: 5 }),
    type: "COMMON",
    sessionId: session.id,
    startDate: endDate.clone().subtract(1, 'day').toISOString(),
    endDate: endDate.toISOString()
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
        startDate: currDate.toISOString(),
        endDate: currDate.clone().add(3, 'days').toISOString(),
        isScheduleOutdated: faker.datatype.boolean(),
      } satisfies SchedulingSection);
      sections.push({
        id: faker.string.uuid(),
        name: faker.lorem.words({ min: 2, max: 5 }),
        type: faker.datatype.boolean() ? "BUNK-JAMBO" : "NON-BUNK-JAMBO",
        sessionId: session.id,
        startDate: currDate.toISOString(),
        endDate: currDate.clone().add(3, 'days').toISOString(),
        isScheduleOutdated: faker.datatype.boolean(),
      } satisfies SchedulingSection);
      continue;
    }
    for (let i = 0; i < daysLeft; i++) {
      sections.push({
        id: faker.string.uuid(),
        name: faker.lorem.words({ min: 2, max: 5 }),
        type: faker.datatype.boolean() ? "BUNK-JAMBO" : "NON-BUNK-JAMBO",
        sessionId: session.id,
        startDate: currDate.toISOString(),
        endDate: currDate.clone().add(3, 'days').toISOString(),
        isScheduleOutdated: faker.datatype.boolean(),
      } satisfies SchedulingSection)
    }
  }

  return [openingSection, ...sections, endingSection];
}