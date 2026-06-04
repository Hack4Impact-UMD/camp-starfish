"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Text, Title, ActionIcon, Flex, Alert, Button } from "@mantine/core";
import { MdArrowBack, MdChevronLeft, MdChevronRight, MdErrorOutline } from "react-icons/md";
import { modals } from "@mantine/modals";
import { PartialWithFieldValue } from "firebase/firestore";
import moment from "moment";

import { Section, SchedulingSectionType, SchedulingSection } from "@/types/sessions/sessionTypes";
import {
  ActivityWithAssignments,
  BlockWithId,
  BundleActivity,
  JamboreeActivity,
  SectionSchedule,
} from "@/types/scheduling/schedulingTypes";
import { isBundleActivity, isBundleActivityWithAssignments } from "@/types/scheduling/schedulingTypeGuards";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import BlockGrid from "./BlockGrid";
import { getCategoryColors } from "./ActivityCard";
import CreateActivityModal from "./CreateActivityModal";
import { TagData } from "./ActivityTagManagementModal";
import { getSectionSchedule, updateSectionSchedule } from "@/data/firestore/sectionSchedules";
import { SectionScheduleDoc } from "@/data/firestore/types/documents";
import useProgramAreas from "@/hooks/programAreas/useProgramAreas";
import useCreateProgramArea from "@/hooks/programAreas/useCreateProgramArea";
import useDeleteProgramArea from "@/hooks/programAreas/useDeleteProgramArea";

interface EditActivitiesModalProps {
  section: Section;
  sections: Section[];
  sessionId: string;
  initialSchedule?: SectionSchedule;
}

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  // Categories are backed by the shared `programAreas` collection so they
  // persist and are visible to everyone. Per-category activity-name suggestions
  // have no backing store and stay local to this editing session.
  const programAreasQuery = useProgramAreas();
  const createProgramArea = useCreateProgramArea();
  const deleteProgramArea = useDeleteProgramArea();
  const [activitiesByCategory, setActivitiesByCategory] = useState<
    Record<string, string[]>
  >({});

  const programAreas = programAreasQuery.data ?? [];
  // Memoize so tagData keeps a stable identity across unrelated re-renders;
  // ActivityTagManagementModal resyncs from it only when it actually changes
  // (otherwise it would clobber in-progress local edits every render).
  const tagData = useMemo<TagData>(
    () => ({
      categories: (programAreasQuery.data ?? [])
        .filter((area) => !area.isDeleted)
        .map((area) => area.name),
      activitiesByCategory,
    }),
    [programAreasQuery.data, activitiesByCategory],
  );
  const categoryNames = tagData.categories;

  // Distinct, deterministic dot color per category for the cards. Built from the
  // current categories plus any used by visible activities (covers soft-deleted
  // categories still on a card) so every dot on screen is consistent + unique.
  const categoryColors = getCategoryColors([
    ...categoryNames,
    ...blocks.flatMap((block) =>
      block.activities
        .filter(isBundleActivityWithAssignments)
        .map((bundleActivity) => bundleActivity.programAreaId),
    ),
  ]);

  // Reconcile category edits against `programAreas`: create newly-added names,
  // soft-delete removed ones. Activity-name suggestions stay local.
  const handleTagDataChange = (next: TagData) => {
    const currentNames = new Set(categoryNames);
    const nextNames = new Set(next.categories);
    next.categories.forEach((name) => {
      if (!currentNames.has(name)) createProgramArea.mutate({ name });
    });
    categoryNames.forEach((name) => {
      if (!nextNames.has(name)) {
        const area = programAreas.find((a) => a.name === name && !a.isDeleted);
        if (area) deleteProgramArea.mutate(area.id);
      }
    });
    setActivitiesByCategory(next.activitiesByCategory);
  };

  // Track schedules and changes per section; seed with initialSchedule to avoid redundant fetch
  const schedulesRef = useRef<Map<string, BlockWithId[]>>(
    initialSchedule
      ? new Map([[initialSection.id, mapScheduleToBlocks(initialSchedule)]])
      : new Map(),
  );
  const sessionIdRef = useRef(sessionId);

  // Preserve each section's alternatePeriodsOff so saving block activities
  // doesn't wipe it; seeded from the initial schedule and refreshed on load.
  const alternatePeriodsOffRef = useRef<Map<string, { [periodId: string]: number[] }>>(
    initialSchedule
      ? new Map([[initialSection.id, initialSchedule.alternatePeriodsOff ?? {}]])
      : new Map(),
  );

  const section: SchedulingSection | undefined =
    schedulingSections[currentIndex] ??
    (initialSection.type !== "COMMON" ? initialSection : undefined);

  const persistSectionBlocks = useCallback(async (blockItems: BlockWithId[]): Promise<boolean> => {
    if (!section || !sessionIdRef.current) return false;

    setSaveInProgress(true);
    setError(null);

    try {
      const blockData: Record<string, { activities: ActivityWithAssignments[]; periodsOff: number[] }> = {};
      blockItems.forEach(block => {
        blockData[block.id] = {
          activities: block.activities,
          periodsOff: block.periodsOff,
        };
      });

      const altOff = alternatePeriodsOffRef.current.get(section.id) ?? {};
      // `type` and `alternatePeriodsOff` are fully typed below; only `blocks`
      // is cast, since the generic block map can't be statically proven to
      // match the schedule doc's discriminated union (activities are shaped to
      // section.type when created in handleActivitySubmit).
      let updates: PartialWithFieldValue<SectionScheduleDoc>;
      if (section.type === "BUNDLE") {
        updates = {
          type: "BUNDLE",
          alternatePeriodsOff: altOff,
          blocks: blockData as Extract<SectionScheduleDoc, { type: "BUNDLE" }>["blocks"],
        };
      } else if (section.type === "BUNK-JAMBO") {
        updates = {
          type: "BUNK-JAMBO",
          alternatePeriodsOff: altOff,
          blocks: blockData as Extract<SectionScheduleDoc, { type: "BUNK-JAMBO" }>["blocks"],
        };
      } else {
        updates = {
          type: "NON-BUNK-JAMBO",
          alternatePeriodsOff: altOff,
          blocks: blockData as Extract<SectionScheduleDoc, { type: "NON-BUNK-JAMBO" }>["blocks"],
        };
      }

      await updateSectionSchedule(sessionIdRef.current, section.id, updates);

      // Keep cache in sync so back-navigation shows the saved state
      schedulesRef.current.set(section.id, blockItems);

      return true;
    } catch {
      setError("Failed to save changes. Please try again.");
      return false;
    } finally {
      setSaveInProgress(false);
    }
  }, [section]);

  // Save current section's blocks before navigating away
  const saveCurrentSection = useCallback(async (): Promise<boolean> => {
    if (!section) return false;
    // Skip the write if nothing changed since the last successful save.
    if (schedulesRef.current.get(section.id) === blocks) return true;
    return persistSectionBlocks(blocks);
  }, [blocks, persistSectionBlocks, section]);

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

        // Fetch the schedule for this section (null = no doc yet, use empty layout)
        const schedule = await getSectionSchedule(sessionId, section.id);
        const blockData = schedule ? mapScheduleToBlocks(schedule) : initialBlocks;

        schedulesRef.current.set(section.id, blockData);
        alternatePeriodsOffRef.current.set(section.id, schedule?.alternatePeriodsOff ?? {});
        setBlocks(blockData);
      } catch {
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

  // Save the current section, then close back to the session page. Stay open if
  // the save failed so the error is visible and changes aren't lost.
  const handleBack = async () => {
    if (await saveCurrentSection()) modals.closeAll();
  };

  const goToPrev = async () => {
    if (currentIndex <= 0) return;
    if (await saveCurrentSection()) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = async () => {
    if (currentIndex >= schedulingSections.length - 1) return;
    if (await saveCurrentSection()) setCurrentIndex(currentIndex + 1);
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
      <Button
        variant="subtle"
        color="dark"
        leftSection={<MdArrowBack size={20} />}
        onClick={handleBack}
        disabled={saveInProgress}
        className="mb-2"
      >
        Back
      </Button>

      {/* Error Alert */}
      {error && (
        <Alert icon={<MdErrorOutline size={16} />} color="red" title="Error" mb="md">
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
          <MdChevronLeft size={32} />
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
          <MdChevronRight size={32} />
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
        categoryColors={categoryColors}
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
        onTagDataChange={handleTagDataChange}
      />
    </div>
  );
}

export function openEditActivitiesModal(props: EditActivitiesModalProps) {
  modals.open({
    fullScreen: true,
    children: <EditActivitiesModal {...props} />,
    // The in-content "Back" button (which saves first) replaces the default close.
    withCloseButton: false,
    classNames: {
      body: "p-0",
    },
  });
}