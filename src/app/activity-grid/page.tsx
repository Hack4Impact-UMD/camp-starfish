"use client";

import { ActivityGrid } from "@/components/ActivityGrid";
import { Block, ProgramAreaID, SectionScheduleID } from "@/types/sessionTypes";
import { Title, Container, Flex } from "@mantine/core";

const bunkJamboBlock: Block<"BUNK-JAMBO"> = {
  activities: [
    {
      name: "Canoeing (Bunk Jambo)",
      description: "Campers learn paddling techniques on the lake.",
      assignments: { bunkNums: [12, 14, 15], adminIds: [201, 202] },
    },
    {
      name: "Archery (Bunk Jambo)",
      description: "Focus and precision training at the archery range.",
      assignments: { bunkNums: [16, 17], adminIds: [203] },
    },
    {
      name: "Swimming (Bunk Jambo)",
      description: "Free swim & water safety practice.",
      assignments: { bunkNums: [8, 9], adminIds: [207] },
    },
  ],
  periodsOff: [3, 7],
};

const nonBunkJamboBlock: Block<"NON-BUNK-JAMBO"> = {
  activities: [
    {
      name: "Nature Walk (Non-Bunk)",
      description: "Exploring trails and learning about wildlife.",
      assignments: { camperIds: [101, 102, 103], staffIds: [401], adminIds: [301] },
    },
    {
      name: "Music (Non-Bunk)",
      description: "Learning basic instruments and rhythm exercises.",
      assignments: { camperIds: [104, 105], staffIds: [402], adminIds: [302] },
    },
    {
      name: "Drama (Non-Bunk)",
      description: "Acting warm-ups, improv games, and skits.",
      assignments: { camperIds: [106], staffIds: [403], adminIds: [303] },
    },
  ],
  periodsOff: [2, 6],
};

const sampleProgramArea: ProgramAreaID = {
  name: "Outdoor Skills",
  isDeleted: false,
  id: "pa-outdoors",
};

const bundleBlock: Block<"BUNDLE"> = {
  activities: [
    {
      name: "Bundle: STEM Lab",
      description: "Hands-on science experiments with rotating stations.",
      programArea: sampleProgramArea,
      ageGroup: "NAV",
      assignments: { camperIds: [120, 121], staffIds: [420], adminIds: [320] },
    },
    {
      name: "Bundle: Cooking",
      description: "Outdoor cooking across rotating groups.",
      programArea: sampleProgramArea,
      ageGroup: "OCP",
      assignments: { camperIds: [122, 123], staffIds: [421], adminIds: [321] },
    },
  ],
  periodsOff: [4],
};

const sampleSectionBunk: SectionScheduleID<"BUNK-JAMBO"> = {
  id: "schedule-bunk-1",
  sessionId: "session-2025",
  sectionId: "section-bunk",
  blocks: { A: bunkJamboBlock },
  alternatePeriodsOff: {},
};

const sampleSectionNonBunk: SectionScheduleID<"NON-BUNK-JAMBO"> = {
  id: "schedule-nonbunk-1",
  sessionId: "session-2025",
  sectionId: "section-nonbunk",
  blocks: { A: nonBunkJamboBlock, B: nonBunkJamboBlock, C: nonBunkJamboBlock },
  alternatePeriodsOff: {},
};

const sampleSectionBundle: SectionScheduleID<"BUNDLE"> = {
  id: "schedule-bundle-1",
  sessionId: "session-2025",
  sectionId: "section-bundle",
  blocks: { A: bundleBlock },
  alternatePeriodsOff: {},
};


export default function page() {
  return (
    <>
      <Container fluid>
        <Title order={3}>Session A</Title>
        <ActivityGrid sectionSchedule={sampleSectionNonBunk} />
      </Container>
    </>
  );
}
