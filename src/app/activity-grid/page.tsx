"use client";

import { ActivityGrid } from "@/components/ActivityGrid";
import { Block, SectionScheduleID } from "@/types/sessionTypes";
import { Title, Container, Flex } from "@mantine/core";

const sampleBlock: Block<"BUNK-JAMBO"> = {
  activities: [
    {
      name: "Canoeing",
      description: "Campers learn paddling techniques on the lake.",
      assignments: { bunkNums: [12, 14, 15], adminIds: [201, 202] },
    },
    {
      name: "Archery",
      description: "Focus and precision training at the archery range.",
      assignments: { bunkNums: [16, 17], adminIds: [203] },
    },
    {
      name: "Arts & Crafts",
      description: "Creative drawing, painting, and crafting projects.",
      assignments: { bunkNums: [18, 19], adminIds: [204] },
    },
    {
      name: "Soccer",
      description: "Team games and drills on the field.",
      assignments: { bunkNums: [10, 11], adminIds: [205] },
    },
    {
      name: "Drama",
      description: "Acting warm-ups, improv games, and skits.",
      assignments: { bunkNums: [12], adminIds: [206] },
    },
    {
      name: "Swimming",
      description: "Free swim & water safety practice.",
      assignments: { bunkNums: [8, 9], adminIds: [207] },
    },
    {
      name: "Music",
      description: "Learning basic instruments and rhythm exercises.",
      assignments: { bunkNums: [15], adminIds: [208] },
    },
    {
      name: "Nature Walk",
      description: "Exploring trails and learning about wildlife.",
      assignments: { bunkNums: [7, 13], adminIds: [209] },
    },
    {
      name: "Rock Climbing",
      description: "Climbing wall safety and challenges.",
      assignments: { bunkNums: [10], adminIds: [210] },
    },
    {
      name: "Cooking",
      description: "Hands-on outdoor cooking lessons.",
      assignments: { bunkNums: [6], adminIds: [211] },
    },
  ],
  periodsOff: [3, 7],
};

const sampleBlock2: Block<"BUNK-JAMBO"> = {
  activities: [
    {
      name: "Camping",
      description: "Campers learn how to camp.",
      assignments: { bunkNums: [1, 4, 5], adminIds: [21, 0] },
    },
    {
      name: "Archery",
      description: "Focus and precision training.",
      assignments: { bunkNums: [16, 17], adminIds: [203] },
    },
    {
      name: "Kayaking",
      description: "Basics of maneuvering individual kayaks.",
      assignments: { bunkNums: [2, 3], adminIds: [220] },
    },
    {
      name: "Basketball",
      description: "Shooting drills and scrimmages.",
      assignments: { bunkNums: [5, 6], adminIds: [221] },
    },
    {
      name: "Tie-Dye",
      description: "Camp shirts tie-dye station.",
      assignments: { bunkNums: [7], adminIds: [222] },
    },
    {
      name: "Fishing",
      description: "Lake fishing with bait and tackle safety.",
      assignments: { bunkNums: [12], adminIds: [223] },
    },
    {
      name: "Yoga",
      description: "Stretching and mindfulness exercises.",
      assignments: { bunkNums: [3, 4], adminIds: [224] },
    },
    {
      name: "Dance",
      description: "Choreography and group dance practice.",
      assignments: { bunkNums: [8], adminIds: [225] },
    },
    {
      name: "STEM Lab",
      description: "Hands-on science experiments.",
      assignments: { bunkNums: [10, 11], adminIds: [226] },
    },
    {
      name: "Board Games",
      description: "Strategy and cooperative tabletop games.",
      assignments: { bunkNums: [9], adminIds: [227] },
    },
  ],
  periodsOff: [2, 6],
};

const sampleSectionSchedule: SectionScheduleID<"BUNK-JAMBO"> = {
  id: "schedule-1",
  sessionId: "session-2025",
  sectionId: "section-5",
  blocks: {
    A: sampleBlock,
    B: sampleBlock2,
  },
  alternatePeriodsOff: {},
};

export default function page() {
  return (
    <>
      <Container fluid>
        <Title order={3}>Session A</Title>
        <ActivityGrid sectionSchedule={sampleSectionSchedule} />
      </Container>
    </>
  );
}
