"use client";

import React from "react";
import { Document, Page, PDFViewer } from "@react-pdf/renderer";
import ProgramAreaGrid from "@/features/scheduling/exporting/ProgramAreaGrid";
import {
  BundleSectionSchedule,
  BundleActivityWithAssignments,
  ProgramArea,
} from "@/types/scheduling/schedulingTypes";

export default function ProgramAreaGridDemoPage() {
  // Mock program areas
  const programAreas: ProgramArea[] = [
    { id: "pa1", name: "Arts & Crafts", isDeleted: false },
    { id: "pa2", name: "Sports", isDeleted: false },
    { id: "pa3", name: "Water Activities", isDeleted: false },
    { id: "pa4", name: "Nature", isDeleted: false },
    { id: "pa5", name: "Music", isDeleted: false },
    { id: "pa6", name: "Drama", isDeleted: false },
    { id: "pa7", name: "Cooking", isDeleted: false },
    { id: "pa8", name: "Science", isDeleted: false },
    { id: "pa9", name: "Photography", isDeleted: false },
    { id: "pa10", name: "Dance", isDeleted: false },
  ];

  // Mock bundle activities
  const createActivity = (
    id: string,
    name: string,
    description: string,
    programArea: ProgramArea,
    ageGroup: "NAV" | "OCP",
  ): BundleActivityWithAssignments => ({
    id,
    name,
    description,
    programAreaId: programArea.id,
    ageGroup,
    camperIds: [],
    staffIds: [],
    adminIds: [],
  });

  // Create mock schedule with multiple blocks and activities
  const mockSchedule: BundleSectionSchedule = {
    sessionId: "demo-session",
    sectionId: "demo-section",
    type: "BUNDLE",
    blocks: {
      A: {
        activities: [
          createActivity("a1", "Pottery", "Learn to make clay pots", programAreas[0], "NAV"),
          createActivity("a2", "Basketball", "Shoot some hoops", programAreas[1], "OCP"),
          createActivity("a3", "Swimming", "Pool time fun", programAreas[2], "NAV"),
          createActivity("a4", "Hiking", "Nature walk", programAreas[3], "OCP"),
          createActivity("a5", "Guitar", "Learn guitar basics", programAreas[4], "NAV"),
          createActivity("a6", "Improv", "Improvisation games", programAreas[5], "OCP"),
          createActivity("a7", "Baking", "Make cookies", programAreas[6], "NAV"),
          createActivity("a8", "Chemistry", "Fun experiments", programAreas[7], "OCP"),
          createActivity("a9", "Portrait", "Take photos", programAreas[8], "NAV"),
          createActivity("a10", "Hip Hop", "Dance moves", programAreas[9], "OCP"),
        ],
        periodsOff: [],
      },
      B: {
        activities: [
          createActivity("b1", "Painting", "Watercolor art", programAreas[0], "OCP"),
          createActivity("b2", "Soccer", "Play soccer", programAreas[1], "NAV"),
          createActivity("b3", "Canoeing", "Paddle on the lake", programAreas[2], "OCP"),
          createActivity("b4", "Bird Watching", "Spot local birds", programAreas[3], "NAV"),
          createActivity("b5", "Drums", "Beat the drums", programAreas[4], "OCP"),
          createActivity("b6", "Skits", "Perform skits", programAreas[5], "NAV"),
          createActivity("b7", "Grilling", "BBQ skills", programAreas[6], "OCP"),
          createActivity("b8", "Astronomy", "Star gazing", programAreas[7], "NAV"),
          createActivity("b9", "Landscape", "Nature photography", programAreas[8], "OCP"),
          createActivity("b10", "Ballet", "Graceful moves", programAreas[9], "NAV"),
        ],
        periodsOff: [],
      },
      C: {
        activities: [
          createActivity("c1", "Collage", "Mixed media art", programAreas[0], "NAV"),
          createActivity("c2", "Tennis", "Tennis match", programAreas[1], "OCP"),
          createActivity("c3", "Water Polo", "Pool game", programAreas[2], "NAV"),
          createActivity("c4", "Gardening", "Plant seeds", programAreas[3], "OCP"),
          createActivity("c5", "Piano", "Piano lessons", programAreas[4], "NAV"),
          createActivity("c6", "Puppet Show", "Create puppets", programAreas[5], "OCP"),
          createActivity("c7", "Smoothies", "Make healthy drinks", programAreas[6], "NAV"),
          createActivity("c8", "Physics", "Motion experiments", programAreas[7], "OCP"),
          createActivity("c9", "Action Shots", "Sports photography", programAreas[8], "NAV"),
          createActivity("c10", "Jazz", "Jazz dance", programAreas[9], "OCP"),
        ],
        periodsOff: [],
      },
      D: {
        activities: [
          createActivity("d1", "Sculpture", "3D art creation", programAreas[0], "OCP"),
          createActivity("d2", "Volleyball", "Beach volleyball", programAreas[1], "NAV"),
          createActivity("d3", "Fishing", "Catch fish", programAreas[2], "OCP"),
          createActivity("d4", "Campfire", "Evening fire", programAreas[3], "NAV"),
          createActivity("d5", "Singing", "Vocal practice", programAreas[4], "OCP"),
          createActivity("d6", "Comedy", "Stand-up comedy", programAreas[5], "NAV"),
          createActivity("d7", "Campfire Cooking", "Cook over fire", programAreas[6], "OCP"),
          createActivity("d8", "Biology", "Study nature", programAreas[7], "NAV"),
          createActivity("d9", "Event Photos", "Document events", programAreas[8], "OCP"),
          createActivity("d10", "Contemporary", "Modern dance", programAreas[9], "NAV"),
        ],
        periodsOff: [],
      },
    },
    alternatePeriodsOff: {},
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b">
        <h1 className="text-2xl font-bold mb-2">Program Area Grid Demo</h1>
        <p className="text-gray-600">
          This demo shows the Program Area Grid PDF component. The grid displays
          activities organized by program area for each block. Activities are
          grouped by their program area, and only the first activity in each cell
          is displayed.
        </p>
      </div>
      <div className="flex-1">
        <PDFViewer width="100%" height="100%">
          <Document>
            <Page size="A4">
              <ProgramAreaGrid
                schedule={mockSchedule}
                programAreas={programAreas}
                sectionName="Summer Session 2024"
              />
            </Page>
          </Document>
        </PDFViewer>
      </div>
    </div>
  );
}
