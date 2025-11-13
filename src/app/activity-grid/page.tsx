"use client";

import { ActivityGrid } from "@/components/ActivityGrid";
import { Block, SectionScheduleID } from "@/types/sessionTypes";
import { Title, Container, Flex } from "@mantine/core";

const sampleBlock: Block<"BUNK-JAMBO"> = {
  activities: [
    {
      name: "Canoeing",
      description: "Campers learn paddling techniques on the lake.",
      assignments: {
        bunkNums: [12, 14, 15],
        adminIds: [201, 202],
      },
    },
    {
      name: "Archery",
      description: "Focus and precision training at the archery range.",
      assignments: {
        bunkNums: [16, 17],
        adminIds: [203],
      },
    },
  ],
  periodsOff: [3, 7],
};

const sampleBlock2: Block<"BUNK-JAMBO"> = {
  activities: [
    {
      name: "Camping",
      description: "Campers learn how to camp",
      assignments: {
        bunkNums: [1, 4, 5],
        adminIds: [21, 0],
      },
    },
    {
      name: "Archery",
      description: "Focus and precision training at the archery range.",
      assignments: {
        bunkNums: [16, 17],
        adminIds: [203],
      },
    },
  ],
  periodsOff: [3, 7],
};

const sampleSectionSchedule: SectionScheduleID<"BUNK-JAMBO"> = {
  id: "schedule-1",
  sessionId: "session-2025",
  sectionId: "section-5",
  blocks: {
    "A": sampleBlock,
    "B": sampleBlock2
    
  },
  alternatePeriodsOff: {},
};

export default function page() {
  return (
    <>
      <Container fluid>
        <Title order={3}>Session A</Title>
        <ActivityGrid sectionSchedule={sampleSectionSchedule}/>
      </Container>
    </>
  );
}
