"use client";

import React, { useState } from "react";
import { Text, Title, ActionIcon, Flex } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { Section } from "@/types/sessions/sessionTypes";
import moment from "moment";
import BlockGrid, { Block } from "./BlockGrid";

const placeholderBlocks: Block[] = [
  {
    id: "a", label: "Block A",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP" },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV" },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV" },
    ],
  },
  {
    id: "b", label: "Block B",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP" },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV" },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV" },
    ],
  },
  {
    id: "c", label: "Block C",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP" },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV" },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV" },
    ],
  },
  {
    id: "d", label: "Block D",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP" },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV" },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV" },
    ],
  },
  {
    id: "e", label: "Block E",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP" },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV" },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP" },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "NAV" },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV" },
    ],
  },
];

interface EditActivitiesModalProps {
  section: Section;
  sections: Section[];
}

export default function EditActivitiesModal({ section: initialSection, sections }: EditActivitiesModalProps) {
  const schedulingSections = sections.filter((s) => s.type !== "COMMON");
  const initialIndex = schedulingSections.findIndex((s) => s.id === initialSection.id);
  const [currentIndex, setCurrentIndex] = useState(Math.max(initialIndex, 0));

  const section = schedulingSections[currentIndex] ?? initialSection;

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < schedulingSections.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <Flex justify="center" align="center" gap="md" className="mb-1">
        <ActionIcon
          variant="transparent"
          color="dark"
          size="xl"
          onClick={goToPrev}
          disabled={currentIndex === 0}
        >
          <IconChevronLeft size={32} />
        </ActionIcon>
        <Title order={1} className="font-bold text-3xl">
          {section.name} Activities
        </Title>
        <ActionIcon
          variant="transparent"
          color="dark"
          size="xl"
          onClick={goToNext}
          disabled={currentIndex === schedulingSections.length - 1}
        >
          <IconChevronRight size={32} />
        </ActionIcon>
      </Flex>

      <Text className="text-center text-sm text-gray-500 mb-2">
        {moment(section.startDate).format("dddd MMMM D, YYYY")} -{" "}
        {moment(section.endDate).format("dddd MMMM D, YYYY")}
      </Text>

      <Text className="text-center text-sm text-red-600 mb-6">
        Edits on this screen will be applied to all users**
      </Text>

      {/* Block grid */}
      <BlockGrid blocks={placeholderBlocks} />
    </div>
  );
}

export function openEditActivitiesModal(props: EditActivitiesModalProps) {
  modals.open({
    fullScreen: true,
    children: <EditActivitiesModal {...props} />,
    closeButtonProps: { size: "xl", "aria-label": "Close" },
    classNames: {
      header: "absolute top-4 left-4 right-auto p-0 bg-transparent",
      close: "w-10 h-10",
      body: "p-0",
    },
  });
}
