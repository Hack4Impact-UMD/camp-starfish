"use client";

import React, { useEffect, useState } from "react";
import { Text, Title, ActionIcon, Flex } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import moment from "moment";

import { Section, SchedulingSectionType, SchedulingSection } from "@/types/sessions/sessionTypes";
import {
  ActivityWithAssignments,
  BundleActivity,
  JamboreeActivity,
  SectionSchedule,
} from "@/types/scheduling/schedulingTypes";
import { isBundleActivity } from "@/types/scheduling/schedulingTypeGuards";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import BlockGrid from "./BlockGrid";
import CreateActivityModal from "./CreateActivityModal";
import { TagData } from "./ActivityTagManagementModal";

interface EditActivitiesModalProps {
  section: Section;
  sections: Section[];
  initialSchedule?: SectionSchedule;
}

const initialTagData: TagData = {
  categories: [
    "Athletics", "Arts & Crafts", "Boating", "Challenge",
    "Dance", "Drama", "Discovery", "Learning Center", "Music", "Outdoor Cooking",
  ],
  activitiesByCategory: {
    Athletics: ["Soccer", "Basketball", "Quidditch", "Football", "Cheerleading", "Fencing", "Cricket", "Ping Pong", "Hoops and HORSE"],
    "Arts & Crafts": ["Paper Dolls", "Painting", "Pottery"],
    Boating: ["Kayaking", "Canoeing", "Sailing"],
    Challenge: ["Ropes Course", "Rock Climbing"],
    Dance: ["Hip Hop", "Jazz", "Ballet"],
    Drama: ["Improv", "Skit Night"],
    Discovery: ["Bird Houses", "Nature Walk"],
    "Learning Center": ["Reading", "Writing"],
    Music: ["Guitar", "Drums", "Singing"],
    "Outdoor Cooking": ["Outdoor Cooking"],
  },
};

type BlockWithId = {
  id: string;
  label: string;
  activities: ActivityWithAssignments[];
  periodsOff: number[];
};

const initialBlocks: BlockWithId[] = [
  {
    id: "a", label: "Block A",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP", programAreaId: "ACTIVATE!", camperIds: [], staffIds: [], adminIds: [] },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV", programAreaId: "Arts & Crafts", camperIds: [], staffIds: [], adminIds: [] },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV", programAreaId: "Discovery", camperIds: [], staffIds: [], adminIds: [] },
    ],
    periodsOff: [],
  },
  {
    id: "b", label: "Block B",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP", programAreaId: "ACTIVATE!", camperIds: [], staffIds: [], adminIds: [] },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV", programAreaId: "Arts & Crafts", camperIds: [], staffIds: [], adminIds: [] },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV", programAreaId: "Discovery", camperIds: [], staffIds: [], adminIds: [] },
    ],
    periodsOff: [],
  },
  {
    id: "c", label: "Block C",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP", programAreaId: "ACTIVATE!", camperIds: [], staffIds: [], adminIds: [] },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV", programAreaId: "Arts & Crafts", camperIds: [], staffIds: [], adminIds: [] },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV", programAreaId: "Discovery", camperIds: [], staffIds: [], adminIds: [] },
    ],
    periodsOff: [],
  },
  {
    id: "d", label: "Block D",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP", programAreaId: "ACTIVATE!", camperIds: [], staffIds: [], adminIds: [] },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV", programAreaId: "Arts & Crafts", camperIds: [], staffIds: [], adminIds: [] },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV", programAreaId: "Discovery", camperIds: [], staffIds: [], adminIds: [] },
    ],
    periodsOff: [],
  },
  {
    id: "e", label: "Block E",
    activities: [
      { id: "1", name: "ACTIVATE!", description: "Jump for Joy!", ageGroup: "OCP", programAreaId: "ACTIVATE!", camperIds: [], staffIds: [], adminIds: [] },
      { id: "2", name: "Arts & Crafts", description: "Paper Dolls", ageGroup: "NAV", programAreaId: "Arts & Crafts", camperIds: [], staffIds: [], adminIds: [] },
      { id: "3", name: "Athletics", description: "Quidditch", ageGroup: "OCP", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "4", name: "Athletics", description: "Quidditch", ageGroup: "NAV", programAreaId: "Athletics", camperIds: [], staffIds: [], adminIds: [] },
      { id: "5", name: "Discovery", description: "Bird Houses", ageGroup: "NAV", programAreaId: "Discovery", camperIds: [], staffIds: [], adminIds: [] },
    ],
    periodsOff: [],
  },
];

function mapScheduleToBlocks(schedule: SectionSchedule): BlockWithId[] {
  return Object.entries(schedule.blocks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([blockId, block]) => ({
      id: blockId,
      label: `Block ${blockId.toUpperCase()}`,
      activities: block.activities,
      periodsOff: block.periodsOff,
    }));
}

interface ModalState {
  opened: boolean;
  blockId: string | null;
  existingActivity?: ActivityWithAssignments;
}

export default function EditActivitiesModal({
  section: initialSection,
  sections,
  initialSchedule,
}: EditActivitiesModalProps) {
  const schedulingSections = sections.filter(isSchedulingSection);
  const initialIndex = schedulingSections.findIndex((s) => s.id === initialSection.id);
  const [currentIndex, setCurrentIndex] = useState(Math.max(initialIndex, 0));
  const [blocks, setBlocks] = useState<BlockWithId[]>(
    initialSchedule ? mapScheduleToBlocks(initialSchedule) : initialBlocks,
  );
  const [modalState, setModalState] = useState<ModalState>({ opened: false, blockId: null });
  const [tagData, setTagData] = useState<TagData>(initialTagData);

  const section: SchedulingSection | undefined =
    schedulingSections[currentIndex] ??
    (initialSection.type !== "COMMON" ? initialSection : undefined);

  useEffect(() => {
    if (!section) return;
    if (initialSchedule && section.id === initialSection.id) {
      setBlocks(mapScheduleToBlocks(initialSchedule));
      return;
    }
    setBlocks(initialBlocks);
  }, [section?.id, initialSection.id, initialSchedule]);

  if (!section) return null;

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < schedulingSections.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleAddActivity = (blockId: string) => {
    setModalState({ opened: true, blockId, existingActivity: undefined, });
  };

  const handleEditActivity = (blockId: string, activity: ActivityWithAssignments) => {
    setModalState({ opened: true, blockId, existingActivity: activity });
  };

  const handleCloseModal = () => {
    setModalState({ opened: false, blockId: null, existingActivity: undefined,});
  };

  const handleActivitySubmit = (activity: BundleActivity | JamboreeActivity) => {
    const { blockId, existingActivity } = modalState;
    if (!blockId) return;

    const newBlockActivity: ActivityWithAssignments = existingActivity
      ? { ...existingActivity, ...activity }
      : isBundleActivity(activity)
        ? {
            ...activity,
            camperIds: [],
            staffIds: [],
            adminIds: [],
          }
        : section.type === "BUNK-JAMBO"
          ? {
              ...activity,
              bunkNums: [],
              adminIds: [],
            }
          : {
              ...activity,
              camperIds: [],
              staffIds: [],
              adminIds: [],
            };

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;

        if (existingActivity) {
          // Edit: replace the existing activity
          let hasReplaced = false;
          return {
            ...block,
            activities: block.activities.map((a) => {
              if (!hasReplaced && a === existingActivity) {
                hasReplaced = true;
                return newBlockActivity;
              }
              if (!hasReplaced && a.id === existingActivity.id) {
                hasReplaced = true;
                return newBlockActivity;
              }
              return a;
            }),
          };
        } else {
          // Create: append to the end of the block
          return {
            ...block,
            activities: [...block.activities, newBlockActivity],
          };
        }
      }),
    );
  };

  const handleActivityDelete = (activityId: string) => {
    const { blockId } = modalState;
    if (!blockId) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          activities: block.activities.filter((a) => a.id !== activityId),
        };
      }),
    );
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
      <BlockGrid
        blocks={blocks}
        onAddActivity={handleAddActivity}
        onEditActivity={handleEditActivity}
      />

      {/* Create/Edit Activity modal - rendered inside the full-screen modal */}
      <CreateActivityModal
        opened={modalState.opened}
        onClose={handleCloseModal}
        sectionType={section.type as SchedulingSectionType}
        existingActivity={modalState.existingActivity}
        onSubmit={handleActivitySubmit}
        onDelete={handleActivityDelete}
        tagData={tagData}
        onTagDataChange={setTagData}
      />
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