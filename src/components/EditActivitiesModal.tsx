"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Text, Title, ActionIcon, Flex, Alert, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconAlertCircle } from "@tabler/icons-react";
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
import { getSectionSchedule, updateSectionSchedule } from "@/data/firestore/sectionSchedules";

interface EditActivitiesModalProps {
  section: Section;
  sections: Section[];
  sessionId: string;
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

const initialBlocks: BlockWithId[] = ["a", "b", "c", "d", "e"].map((id) => ({
  id,
  label: `Block ${id.toUpperCase()}`,
  activities: [],
  periodsOff: [],
}));

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
  sessionId,
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  // Track schedules and changes per section; seed with initialSchedule to avoid redundant fetch
  const schedulesRef = useRef<Map<string, BlockWithId[]>>(
    initialSchedule
      ? new Map([[initialSection.id, mapScheduleToBlocks(initialSchedule)]])
      : new Map(),
  );
  const sessionIdRef = useRef(sessionId);

  const section: SchedulingSection | undefined =
    schedulingSections[currentIndex] ??
    (initialSection.type !== "COMMON" ? initialSection : undefined);

  const persistSectionBlocks = useCallback(async (blockItems: BlockWithId[]): Promise<boolean> => {
    if (!section || !sessionIdRef.current) return false;

    setSaveInProgress(true);
    setError(null);

    try {
      const blockData: Record<string, any> = {};
      blockItems.forEach(block => {
        blockData[block.id] = {
          activities: block.activities,
          periodsOff: block.periodsOff,
        };
      });

      await updateSectionSchedule(
        sessionIdRef.current,
        section.id,
        {
          type: section.type,
          alternatePeriodsOff: {},
          blocks: blockData,
        },
      );

      // Keep cache in sync so back-navigation shows the saved state
      schedulesRef.current.set(section.id, blockItems);

      return true;
    } catch (err) {
      console.error("Failed to save section schedule:", err);
      setError("Failed to save changes. Please try again.");
      return false;
    } finally {
      setSaveInProgress(false);
    }
  }, [section]);

  // Save current section's blocks before navigating away
  const saveCurrentSection = useCallback(async (): Promise<boolean> => {
    return persistSectionBlocks(blocks);
  }, [blocks, persistSectionBlocks]);

  // Load schedule when navigating to a new section
  useEffect(() => {
    if (!section) return;

    const loadSectionSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we've already cached this section
        const cached = schedulesRef.current.get(section.id);
        if (cached) {
          setBlocks(cached);
          return;
        }

        // Fetch the schedule for this section
        const schedule = await getSectionSchedule(sessionId, section.id);
        const blockData = mapScheduleToBlocks(schedule);
        
        schedulesRef.current.set(section.id, blockData);
        setBlocks(blockData);
      } catch (err) {
        console.error("Failed to load section schedule:", err);

        if (err instanceof Error && err.message.includes("Document not found")) {
          setBlocks(initialBlocks);
          return;
        }

        setError("Failed to load section activities. Using default layout.");
        setBlocks(initialBlocks);
      } finally {
        setLoading(false);
      }
    };

    loadSectionSchedule();
  // section?.id is intentional: we only re-fetch when the section changes, not on every render.
  // sessionId never changes while the modal is open but is included for correctness.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id, sessionId]);

  if (!section) return null;

  const goToPrev = async () => {
    if (currentIndex <= 0) return;
    await saveCurrentSection();
    setCurrentIndex(currentIndex - 1);
  };

  const goToNext = async () => {
    if (currentIndex >= schedulingSections.length - 1) return;
    await saveCurrentSection();
    setCurrentIndex(currentIndex + 1);
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

  const handleActivitySubmit = async (activity: BundleActivity | JamboreeActivity) => {
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

    const nextBlocks = blocks.map((block) => {
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
      }

      // Create: append to the end of the block
      return {
        ...block,
        activities: [...block.activities, newBlockActivity],
      };
    });

    setBlocks(nextBlocks);
    await persistSectionBlocks(nextBlocks);
  };

  const handleActivityDelete = async (activityId: string) => {
    const { blockId } = modalState;
    if (!blockId) return;

    const nextBlocks = blocks.map((block) => {
      if (block.id !== blockId) return block;
      return {
        ...block,
        activities: block.activities.filter((a) => a.id !== activityId),
      };
    });

    setBlocks(nextBlocks);
    await persistSectionBlocks(nextBlocks);
  };

  return (
    <div className="p-8">
      {/* Error Alert */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error" mb="md">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Alert color="blue" title="Loading..." mb="md">
          Loading section activities...
        </Alert>
      )}

      {/* Header */}
      <Flex justify="center" align="center" gap="md" className="mb-1">
        <ActionIcon
          variant="transparent"
          color="dark"
          size="xl"
          aria-label="Previous section"
          onClick={goToPrev}
          disabled={currentIndex === 0 || loading || saveInProgress}
        >
          <IconChevronLeft size={32} />
        </ActionIcon>
        <Title order={1} className="font-bold text-3xl">
          {section.name} Activities
        </Title>
        <Button
          variant="outline"
          onClick={saveCurrentSection}
          loading={saveInProgress}
          disabled={loading || saveInProgress}
        >
          Save
        </Button>
        <ActionIcon
          variant="transparent"
          color="dark"
          size="xl"
          aria-label="Next section"
          onClick={goToNext}
          disabled={currentIndex === schedulingSections.length - 1 || loading || saveInProgress}
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