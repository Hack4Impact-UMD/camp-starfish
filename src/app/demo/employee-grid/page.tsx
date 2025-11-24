"use client";

import { PDFViewer } from "@react-pdf/renderer";
import EmployeeGrid from "@/features/scheduling/exporting/EmployeeGrid";
import {
  SectionScheduleID,
  Freeplay,
  CamperAttendeeID,
  StaffAttendeeID,
  AdminAttendeeID,
} from "@/types/sessionTypes";

// Mock test data
const mockSchedule: SectionScheduleID<"BUNDLE"> = {
  id: "schedule1",
  sessionId: "session1",
  sectionId: "section1",
  blocks: {
    A: {
      activities: [
        {
          name: "Swimming",
          description: "Pool activities",
          programArea: { id: "AQUA", name: "Aquatics", isDeleted: false },
          ageGroup: "NAV",
          assignments: {
            camperIds: [1, 2, 3],
            staffIds: [101, 102],
            adminIds: [201],
          },
        },
        {
          name: "Arts & Crafts",
          description: "Creative activities",
          programArea: { id: "ARTS", name: "Arts", isDeleted: false },
          ageGroup: "OCP",
          assignments: {
            camperIds: [4, 5],
            staffIds: [103],
            adminIds: [],
          },
        },
      ],
      periodsOff: [],
    },
    B: {
      activities: [
        {
          name: "Sports",
          description: "Field games",
          programArea: { id: "SPRT", name: "Sports", isDeleted: false },
          ageGroup: "NAV",
          assignments: {
            camperIds: [1, 2, 6, 7],
            staffIds: [101, 104],
            adminIds: [201],
          },
        },
        {
          name: "Nature",
          description: "Outdoor exploration",
          programArea: { id: "NATR", name: "Nature", isDeleted: false },
          ageGroup: "OCP",
          assignments: {
            camperIds: [3, 4, 5],
            staffIds: [102, 103],
            adminIds: [],
          },
        },
      ],
      periodsOff: [],
    },
    C: {
      activities: [
        {
          name: "Music",
          description: "Musical activities",
          programArea: { id: "MUSC", name: "Music", isDeleted: false },
          ageGroup: "NAV",
          assignments: {
            camperIds: [6, 7, 8],
            staffIds: [104],
            adminIds: [201],
          },
        },
      ],
      periodsOff: [],
    },
  },
  alternatePeriodsOff: {
    A: [102],
  },
};

const mockFreeplay: Freeplay = {
  posts: {
    "post1": [201],
    "post2": [101],
  },
  buddies: {
    101: [1, 2],
    102: [3, 4],
    103: [5],
    104: [6, 7],
  },
};

const mockCampers: CamperAttendeeID[] = [
  {
    id: 1,
    sessionId: "session1",
    name: { firstName: "Alice", lastName: "Smith" },
    gender: "Female",
    dateOfBirth: "2010-05-15",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "NAV",
    level: 1,
    bunk: 1,
    swimOptOut: false,
  },
  {
    id: 2,
    sessionId: "session1",
    name: { firstName: "Bob", lastName: "Jones" },
    gender: "Male",
    dateOfBirth: "2010-07-20",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "NAV",
    level: 1,
    bunk: 1,
    swimOptOut: false,
  },
  {
    id: 3,
    sessionId: "session1",
    name: { firstName: "Charlie", lastName: "Brown" },
    gender: "Male",
    dateOfBirth: "2011-03-10",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "NAV",
    level: 2,
    bunk: 2,
    swimOptOut: false,
  },
  {
    id: 4,
    sessionId: "session1",
    name: { firstName: "Diana", lastName: "Wilson" },
    gender: "Female",
    dateOfBirth: "2009-11-25",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "OCP",
    level: 3,
    bunk: 2,
    swimOptOut: false,
  },
  {
    id: 5,
    sessionId: "session1",
    name: { firstName: "Eve", lastName: "Davis" },
    gender: "Female",
    dateOfBirth: "2009-09-12",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "OCP",
    level: 3,
    bunk: 3,
    swimOptOut: false,
  },
  {
    id: 6,
    sessionId: "session1",
    name: { firstName: "Frank", lastName: "Miller" },
    gender: "Male",
    dateOfBirth: "2010-01-30",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "NAV",
    level: 2,
    bunk: 3,
    swimOptOut: false,
  },
  {
    id: 7,
    sessionId: "session1",
    name: { firstName: "Grace", lastName: "Taylor" },
    gender: "Female",
    dateOfBirth: "2010-08-05",
    nonoList: [],
    role: "CAMPER",
    ageGroup: "NAV",
    level: 1,
    bunk: 4,
    swimOptOut: false,
  },
];

const mockStaff: StaffAttendeeID[] = [
  {
    id: 101,
    sessionId: "session1",
    name: { firstName: "John", lastName: "Counselor" },
    gender: "Male",
    nonoList: [],
    yesyesList: [],
    role: "STAFF",
    bunk: 1,
    leadBunkCounselor: true,
    daysOff: [],
  },
  {
    id: 102,
    sessionId: "session1",
    name: { firstName: "Jane", lastName: "Leader" },
    gender: "Female",
    nonoList: [],
    yesyesList: [],
    role: "STAFF",
    bunk: 2,
    leadBunkCounselor: true,
    daysOff: [],
  },
  {
    id: 103,
    sessionId: "session1",
    name: { firstName: "Mike", lastName: "Helper" },
    gender: "Male",
    nonoList: [],
    yesyesList: [],
    role: "STAFF",
    bunk: 3,
    leadBunkCounselor: false,
    daysOff: [],
  },
  {
    id: 104,
    sessionId: "session1",
    name: { firstName: "Sarah", lastName: "Assistant" },
    gender: "Female",
    nonoList: [],
    yesyesList: [],
    role: "STAFF",
    bunk: 4,
    leadBunkCounselor: true,
    daysOff: [],
  },
];

const mockAdmins: AdminAttendeeID[] = [
  {
    id: 201,
    sessionId: "session1",
    name: { firstName: "Admin", lastName: "Director" },
    gender: "Male",
    nonoList: [],
    yesyesList: [],
    role: "ADMIN",
    daysOff: [],
  },
];

export default function EmployeeGridDemo() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-emerald-600">
          UI Demo
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">Employee Grid</h1>
        <p className="text-sm text-gray-600">
          Each employee&apos;s (staff or admin) assignments for the day. Shows
          name, block assignments, alternate period off (APO), and freeplay
          assignments.
        </p>
      </header>
      <div className="flex gap-4">
        <div className="flex-1">
          <h2 className="mb-2 text-lg font-semibold">Staff Assignments</h2>
          <div className="w-full" style={{ height: "90vh" }}>
            <PDFViewer width="100%" height="100%">
              <EmployeeGrid
                schedule={mockSchedule}
                freeplay={mockFreeplay}
                campers={mockCampers}
                employees={mockStaff}
              />
            </PDFViewer>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="mb-2 text-lg font-semibold">Admin Assignments</h2>
          <div className="w-full" style={{ height: "90vh" }}>
            <PDFViewer width="100%" height="100%">
              <EmployeeGrid
                schedule={mockSchedule}
                freeplay={mockFreeplay}
                campers={mockCampers}
                employees={mockAdmins}
              />
            </PDFViewer>
          </div>
        </div>
      </div>
    </main>
  );
}

