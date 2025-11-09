import React from "react";
import ReactPDF from "@react-pdf/renderer";
import { Document, Page } from "@react-pdf/renderer";
import ScheduleGrid from "../exporting/BlockRatiosGrid";
import { SectionSchedule } from "@/types/sessionTypes";

// Sample attendees with complete type consistency
const sampleCampers = [
  { 
    id: 1, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Katelyn", lastName: "King" },
    gender: 'Female' as const,
    dateOfBirth: '2010-03-15',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 1,
    bunk: 1,
    swimOptOut: false
  },
  { 
    id: 2, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Heidi", lastName: "Harris" },
    gender: 'Female' as const,
    dateOfBirth: '2010-07-22',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 1,
    bunk: 1,
    swimOptOut: false
  },
  { 
    id: 3, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Emma", lastName: "Evans" },
    gender: 'Female' as const,
    dateOfBirth: '2010-05-10',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 2,
    bunk: 2,
    swimOptOut: false
  },
  { 
    id: 4, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Oliver", lastName: "Owens" },
    gender: 'Male' as const,
    dateOfBirth: '2011-01-05',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 2,
    bunk: 2,
    swimOptOut: false
  },
  { 
    id: 5, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Sophia", lastName: "Smith" },
    gender: 'Female' as const,
    dateOfBirth: '2011-03-18',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 2,
    bunk: 2,
    swimOptOut: false
  },
  { 
    id: 6, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Liam", lastName: "Lee" },
    gender: 'Male' as const,
    dateOfBirth: '2010-11-30',
    nonoList: [],
    ageGroup: 'OCP' as const,
    level: 3,
    bunk: 3,
    swimOptOut: false
  },
  { 
    id: 7, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Ava", lastName: "Anderson" },
    gender: 'Female' as const,
    dateOfBirth: '2012-04-12',
    nonoList: [],
    ageGroup: 'OCP' as const,
    level: 3,
    bunk: 3,
    swimOptOut: true
  },
  { 
    id: 8, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Lydia", lastName: "Lopez" },
    gender: 'Female' as const,
    dateOfBirth: '2010-08-25',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 1,
    bunk: 4,
    swimOptOut: false
  },
  { 
    id: 9, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Madeleine", lastName: "Miller" },
    gender: 'Female' as const,
    dateOfBirth: '2010-12-08',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 1,
    bunk: 4,
    swimOptOut: false
  },
  { 
    id: 10, 
    sessionId: 'session-1',
    role: 'CAMPER' as const,
    name: { firstName: "Natalie", lastName: "Nelson" },
    gender: 'Female' as const,
    dateOfBirth: '2011-02-14',
    nonoList: [],
    ageGroup: 'NAV' as const,
    level: 1,
    bunk: 4,
    swimOptOut: false
  },
];

const sampleStaff = [
  { 
    id: 101, 
    sessionId: 'session-1',
    role: 'STAFF' as const,
    name: { firstName: "Jeff", lastName: "Nelson" },
    gender: 'Male' as const,
    nonoList: [],
    yesyesList: [],
    programCounselor: { name: 'Sports', isDeleted: false },
    bunk: 1,
    leadBunkCounselor: false,
    daysOff: []
  },
  { 
    id: 102, 
    sessionId: 'session-1',
    role: 'STAFF' as const,
    name: { firstName: "Maria", lastName: "Martin" },
    gender: 'Female' as const,
    nonoList: [],
    yesyesList: [],
    programCounselor: { name: 'Swimming', isDeleted: false },
    bunk: 2,
    leadBunkCounselor: true,
    daysOff: []
  },
  { 
    id: 103, 
    sessionId: 'session-1',
    role: 'STAFF' as const,
    name: { firstName: "John", lastName: "Jones" },
    gender: 'Male' as const,
    nonoList: [],
    yesyesList: [],
    bunk: 2,
    leadBunkCounselor: false,
    daysOff: []
  },
  { 
    id: 104, 
    sessionId: 'session-1',
    role: 'STAFF' as const,
    name: { firstName: "Tom", lastName: "Thomas" },
    gender: 'Male' as const,
    nonoList: [],
    yesyesList: [],
    programCounselor: { name: 'Nature', isDeleted: false },
    bunk: 3,
    leadBunkCounselor: false,
    daysOff: []
  },
  { 
    id: 105, 
    sessionId: 'session-1',
    role: 'STAFF' as const,
    name: { firstName: "Dexter", lastName: "Davis" },
    gender: 'Male' as const,
    nonoList: [],
    yesyesList: [],
    programCounselor: { name: 'Arts', isDeleted: false },
    bunk: 4,
    leadBunkCounselor: true,
    daysOff: []
  },
];

const sampleAdmins = [
  { 
    id: 201, 
    sessionId: 'session-1',
    role: 'ADMIN' as const,
    name: { firstName: "Sarah", lastName: "Smith" },
    gender: 'Female' as const,
    nonoList: [],
    yesyesList: [],
    daysOff: []
  },
  { 
    id: 202, 
    sessionId: 'session-1',
    role: 'ADMIN' as const,
    name: { firstName: "Alice", lastName: "Adams" },
    gender: 'Female' as const,
    nonoList: [],
    yesyesList: [],
    daysOff: []
  },
];

// Create SectionSchedule structure with proper types
const sampleSchedule: SectionSchedule<'BUNDLE'> = {
  blocks: {
    A: {
      activities: [
        {
          name: 'Sports',
          description: 'Outdoor sports activities',
          programArea: { name: 'Sports', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [1, 2],
            staffIds: [101], // Jeff is program counselor for Sports
            adminIds: [],
          },
        },
        {
          name: 'Swimming',
          description: 'Water activities and swimming',
          programArea: { name: 'Swimming', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [3, 4, 5],
            staffIds: [102, 103], // Maria is program counselor for Swimming
            adminIds: [201],
          },
        },
        {
          name: 'Archery',
          description: 'Target practice with bows',
          programArea: { name: 'Sports', isDeleted: false },
          ageGroup: 'OCP',
          assignments: {
            camperIds: [6, 7],
            staffIds: [101, 104], // Jeff is program counselor for Sports
            adminIds: [],
          },
        },
        {
          name: 'Painting',
          description: 'Watercolor and acrylic painting',
          programArea: { name: 'Arts', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [8, 9, 10],
            staffIds: [105], // Dexter is program counselor for Arts
            adminIds: [202],
          },
        },
      ],
      periodsOff: [],
    },
    B: {
      activities: [
        {
          name: 'Nature Hike',
          description: 'Exploring nature trails',
          programArea: { name: 'Nature', isDeleted: false },
          ageGroup: 'OCP',
          assignments: {
            camperIds: [6, 7],
            staffIds: [104], // Tom is program counselor for Nature
            adminIds: [],
          },
        },
        {
          name: 'Arts & Crafts',
          description: 'Creative art projects',
          programArea: { name: 'Arts', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [8, 9, 10],
            staffIds: [105, 103], // Dexter is program counselor for Arts
            adminIds: [202],
          },
        },
        {
          name: 'Diving',
          description: 'Diving board practice',
          programArea: { name: 'Swimming', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [1, 2, 3],
            staffIds: [102], // Maria is program counselor for Swimming
            adminIds: [201],
          },
        },
        {
          name: 'Soccer',
          description: 'Team soccer games',
          programArea: { name: 'Sports', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [4, 5],
            staffIds: [101, 104], // Jeff is program counselor for Sports
            adminIds: [],
          },
        },
      ],
      periodsOff: [],
    },
    C: {
      activities: [
        {
          name: 'Basketball',
          description: 'Team basketball games',
          programArea: { name: 'Sports', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [1, 3, 4],
            staffIds: [101, 103], // Jeff is program counselor for Sports
            adminIds: [201],
          },
        },
        {
          name: 'Pottery',
          description: 'Clay sculpting and pottery',
          programArea: { name: 'Arts', isDeleted: false },
          ageGroup: 'OCP',
          assignments: {
            camperIds: [6, 7],
            staffIds: [105], // Dexter is program counselor for Arts
            adminIds: [],
          },
        },
        {
          name: 'Bird Watching',
          description: 'Identifying local birds',
          programArea: { name: 'Nature', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [2, 5],
            staffIds: [104, 102], // Tom is program counselor for Nature
            adminIds: [],
          },
        },
        {
          name: 'Lap Swimming',
          description: 'Swimming laps for fitness',
          programArea: { name: 'Swimming', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [8, 9, 10],
            staffIds: [102, 103], // Maria is program counselor for Swimming
            adminIds: [202],
          },
        },
      ],
      periodsOff: [],
    },
    D: {
      activities: [
        {
          name: 'Kayaking',
          description: 'Kayaking on the lake',
          programArea: { name: 'Swimming', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [2, 5, 8, 9],
            staffIds: [102, 103], // Maria is program counselor for Swimming
            adminIds: [202],
          },
        },
        {
          name: 'Wildlife Study',
          description: 'Observing local wildlife',
          programArea: { name: 'Nature', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [1, 10],
            staffIds: [104, 101], // Tom is program counselor for Nature
            adminIds: [],
          },
        },
        {
          name: 'Volleyball',
          description: 'Beach volleyball games',
          programArea: { name: 'Sports', isDeleted: false },
          ageGroup: 'OCP',
          assignments: {
            camperIds: [6, 7],
            staffIds: [101], // Jeff is program counselor for Sports
            adminIds: [201],
          },
        },
        {
          name: 'Music & Theater',
          description: 'Singing and drama activities',
          programArea: { name: 'Arts', isDeleted: false },
          ageGroup: 'NAV',
          assignments: {
            camperIds: [3, 4],
            staffIds: [105, 104], // Dexter is program counselor for Arts
            adminIds: [],
          },
        },
      ],
      periodsOff: [],
    },
  },
  alternatePeriodsOff: {},
};

export function generatePDF() {
        return <Document>
        <Page size="A4" orientation="landscape">
          <ScheduleGrid 
            schedule={sampleSchedule} 
            blockOrder={['A', 'B', 'C', 'D']}
            campers={sampleCampers}
            staff={sampleStaff}
            admins={sampleAdmins}
          />
        </Page>
      </Document>

}