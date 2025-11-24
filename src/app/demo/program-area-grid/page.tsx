"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { ProgramAreaGrid } from "@/features/scheduling/ProgramAreaGrid";
import { SectionSchedule } from "@/types/sessionTypes";

// Mock test data
const mockSchedule: SectionSchedule<"BUNDLE"> = {
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
        {
          name: "Advanced Swimming",
          description: "Advanced pool activities",
          programArea: { id: "AQUA", name: "Aquatics", isDeleted: false },
          ageGroup: "OCP",
          assignments: {
            camperIds: [6, 7],
            staffIds: [104],
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
        {
          name: "Basketball",
          description: "Basketball activities",
          programArea: { id: "SPRT", name: "Sports", isDeleted: false },
          ageGroup: "NAV",
          assignments: {
            camperIds: [8],
            staffIds: [101],
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
        {
          name: "Drama",
          description: "Theater activities",
          programArea: { id: "ARTS", name: "Arts", isDeleted: false },
          ageGroup: "OCP",
          assignments: {
            camperIds: [1, 2],
            staffIds: [102],
            adminIds: [],
          },
        },
      ],
      periodsOff: [],
    },
    D: {
      activities: [
        {
          name: "Soccer",
          description: "Soccer activities",
          programArea: { id: "SPRT", name: "Sports", isDeleted: false },
          ageGroup: "NAV",
          assignments: {
            camperIds: [3, 4],
            staffIds: [103],
            adminIds: [],
          },
        },
        {
          name: "Water Polo",
          description: "Water polo activities",
          programArea: { id: "AQUA", name: "Aquatics", isDeleted: false },
          ageGroup: "OCP",
          assignments: {
            camperIds: [5, 6],
            staffIds: [101],
            adminIds: [],
          },
        },
      ],
      periodsOff: [],
    },
  },
  alternatePeriodsOff: {},
};

export default function ProgramAreaGridDemo() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-emerald-600">
          UI Demo
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Program Area Grid
        </h1>
        <p className="text-sm text-gray-600">
          Overview of which program areas are occurring during each block. Shows
          all activities grouped by program area for each block.
        </p>
      </header>
      <div className="w-full" style={{ height: "100vh" }}>
        <PDFViewer width="100%" height="100%">
          <ProgramAreaGrid
            schedule={mockSchedule}
            sectionName="Summer Session 2024"
          />
        </PDFViewer>
      </div>
    </main>
  );
}

