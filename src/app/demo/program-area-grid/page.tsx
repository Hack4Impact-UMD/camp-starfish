"use client";

import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { ProgramAreaGrid } from "@/features/scheduling/ProgramAreaGrid";
import {
  SectionSchedule,
  BundleActivity,
  ProgramAreaID,
  IndividualAssignments,
} from "@/types/sessionTypes";

export default function ProgramAreaGridDemoPage() {
  // Mock program areas
  const programAreas: ProgramAreaID[] = [
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
    name: string,
    description: string,
    programArea: ProgramAreaID,
    ageGroup: "NAV" | "OCP"
  ): BundleActivity & { assignments: IndividualAssignments } => ({
    name,
    description,
    programArea,
    ageGroup,
    assignments: {
      camperIds: [],
      staffIds: [],
      adminIds: [],
    },
  });

  // Create mock schedule with multiple blocks and activities
  const mockSchedule: SectionSchedule<"BUNDLE"> = {
    blocks: {
      A: {
        activities: [
          createActivity("Pottery", "Learn to make clay pots", programAreas[0], "NAV"),
          createActivity("Basketball", "Shoot some hoops", programAreas[1], "OCP"),
          createActivity("Swimming", "Pool time fun", programAreas[2], "NAV"),
          createActivity("Hiking", "Nature walk", programAreas[3], "OCP"),
          createActivity("Guitar", "Learn guitar basics", programAreas[4], "NAV"),
          createActivity("Improv", "Improvisation games", programAreas[5], "OCP"),
          createActivity("Baking", "Make cookies", programAreas[6], "NAV"),
          createActivity("Chemistry", "Fun experiments", programAreas[7], "OCP"),
          createActivity("Portrait", "Take photos", programAreas[8], "NAV"),
          createActivity("Hip Hop", "Dance moves", programAreas[9], "OCP"),
        ],
        periodsOff: [],
      },
      B: {
        activities: [
          createActivity("Painting", "Watercolor art", programAreas[0], "OCP"),
          createActivity("Soccer", "Play soccer", programAreas[1], "NAV"),
          createActivity("Canoeing", "Paddle on the lake", programAreas[2], "OCP"),
          createActivity("Bird Watching", "Spot local birds", programAreas[3], "NAV"),
          createActivity("Drums", "Beat the drums", programAreas[4], "OCP"),
          createActivity("Skits", "Perform skits", programAreas[5], "NAV"),
          createActivity("Grilling", "BBQ skills", programAreas[6], "OCP"),
          createActivity("Astronomy", "Star gazing", programAreas[7], "NAV"),
          createActivity("Landscape", "Nature photography", programAreas[8], "OCP"),
          createActivity("Ballet", "Graceful moves", programAreas[9], "NAV"),
        ],
        periodsOff: [],
      },
      C: {
        activities: [
          createActivity("Collage", "Mixed media art", programAreas[0], "NAV"),
          createActivity("Tennis", "Tennis match", programAreas[1], "OCP"),
          createActivity("Water Polo", "Pool game", programAreas[2], "NAV"),
          createActivity("Gardening", "Plant seeds", programAreas[3], "OCP"),
          createActivity("Piano", "Piano lessons", programAreas[4], "NAV"),
          createActivity("Puppet Show", "Create puppets", programAreas[5], "OCP"),
          createActivity("Smoothies", "Make healthy drinks", programAreas[6], "NAV"),
          createActivity("Physics", "Motion experiments", programAreas[7], "OCP"),
          createActivity("Action Shots", "Sports photography", programAreas[8], "NAV"),
          createActivity("Jazz", "Jazz dance", programAreas[9], "OCP"),
        ],
        periodsOff: [],
      },
      D: {
        activities: [
          createActivity("Sculpture", "3D art creation", programAreas[0], "OCP"),
          createActivity("Volleyball", "Beach volleyball", programAreas[1], "NAV"),
          createActivity("Fishing", "Catch fish", programAreas[2], "OCP"),
          createActivity("Campfire", "Evening fire", programAreas[3], "NAV"),
          createActivity("Singing", "Vocal practice", programAreas[4], "OCP"),
          createActivity("Comedy", "Stand-up comedy", programAreas[5], "NAV"),
          createActivity("Campfire Cooking", "Cook over fire", programAreas[6], "OCP"),
          createActivity("Biology", "Study nature", programAreas[7], "NAV"),
          createActivity("Event Photos", "Document events", programAreas[8], "OCP"),
          createActivity("Contemporary", "Modern dance", programAreas[9], "NAV"),
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
          <ProgramAreaGrid schedule={mockSchedule} sectionName="Summer Session 2024" />
        </PDFViewer>
      </div>
    </div>
  );
}

