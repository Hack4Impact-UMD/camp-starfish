"use client";

import { ActivityGrid } from "@/components/ActivityGrid";
import {
  Block,
  ProgramAreaID,
  SchedulingSectionType,
  SectionScheduleID,
} from "@/types/sessionTypes";
import {
  Title,
  Container,
  Flex,
  Box,
  ActionIcon,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

import { EditActivityCard } from "@/components/EditActivityCard";

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
      assignments: {
        camperIds: [101, 102],
        staffIds: [401],
        adminIds: [301],
      },
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

    {
      name: "Arts & Crafts (Non-Bunk)",
      description: "Painting, bracelet-making, and creative free art time.",
      assignments: { camperIds: [107, 108], staffIds: [404], adminIds: [304] },
    },
    {
      name: "Soccer (Non-Bunk)",
      description: "Scrimmages, drills, and teamwork-focused gameplay.",
      assignments: { camperIds: [109, 110], staffIds: [405], adminIds: [305] },
    },
    {
      name: "Yoga & Mindfulness (Non-Bunk)",
      description: "Stretching, breathing exercises, and calm focus.",
      assignments: { camperIds: [111], staffIds: [406], adminIds: [306] },
    },
    {
      name: "Outdoor Survival (Non-Bunk)",
      description:
        "Fire building, shelter making, and basic navigation skills.",
      assignments: { camperIds: [112, 113], staffIds: [407], adminIds: [307] },
    },
    {
      name: "Photography (Non-Bunk)",
      description: "Basic camera skills and creative photo challenges.",
      assignments: { camperIds: [114], staffIds: [408], adminIds: [308] },
    },
    {
      name: "Team Building Games (Non-Bunk)",
      description: "Problem-solving activities that require collaboration.",
      assignments: { camperIds: [115, 116], staffIds: [409], adminIds: [309] },
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
const allSections: SectionScheduleID<SchedulingSectionType>[] = [
  sampleSectionBunk,
  sampleSectionNonBunk,
  sampleSectionBundle,
];

export default function page() {
  const theme = useMantineTheme();
  const [index, setIndex] = useState(0);
  const currSection = allSections[index];

  const nextSection = () => {
    setIndex((prev) => (prev + 1) % allSections.length);
  };

  const prevSection = () => {
    setIndex((prev) => (prev - 1 + allSections.length) % allSections.length);
  };

  return (
    <>
      <Container>
        <Title order={3}>Session A</Title>
        <Flex direction={"column"}>
          <Box
            style={{
              background: theme.colors["blue-0"][0],
              borderRadius: 8,
              border: "1px solid #bcd2e8",
            }}
          >
            <Flex align="center" justify="space-between">
              <ActionIcon
                size="lg"
                variant="subtle"
                radius="xl"
                onClick={prevSection}
              >
                <IconChevronLeft size={22} />
              </ActionIcon>
              <Flex>
                <Text fw={600} size="lg">
                  {currSection.sectionId.toUpperCase()}
                </Text>
              </Flex>

              <ActionIcon
                size="lg"
                variant="subtle"
                radius="xl"
                onClick={nextSection}
              >
                <IconChevronRight size={22} />
              </ActionIcon>
            </Flex>
          </Box>
          <ActivityGrid sectionSchedule={allSections[index]} />
        </Flex>
      </Container>

      <Container>
        <EditActivityCard
          author="Parth"
          block={{
            ...bundleBlock,
            id: "A",
          }}
          activities={bundleBlock.activities}
        />
      </Container>
    </>
  );
}
