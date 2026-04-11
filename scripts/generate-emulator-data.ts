import { faker } from "@faker-js/faker";
import { Admin, Camper, Gender, Parent, Photographer, Staff } from "@/types/users/userTypes";
import { Album } from "@/types/albums/albumTypes";
import { Session } from "@/types/sessions/sessionTypes";

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

export function generateSession(): Session {

}

export function generateAlbum(): Album {

}