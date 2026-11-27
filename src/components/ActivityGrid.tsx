"use client";

import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { Attendee, SchedulingSection } from "@/types/sessions/sessionTypes";
import { useMemo } from "react";
import ActivityGridRow from "@/components/ActivityGridRow";
import { Box, SimpleGrid } from "@mantine/core";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import useAttendeeList from "@/hooks/attendees/useAttendeeList";
import LoadingPage from "@/app/loading";
import { isNotFoundError } from "@/data/firestore/firestoreClientOperations";
import { getAttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";
import useSection from "@/hooks/sections/useSection";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import {
  getBlockIndexFromNum,
  getBlocksInOrder,
} from "@/types/scheduling/schedulingUtils";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { moveAssignment } from "@/features/scheduling/editing/moveAssignment";

interface ActivityGridProps {
  sessionId: string;
  sectionId: string;
  /** Unsaved schedule to show instead of the one saved in Firestore. */
  draftSchedule?: SectionSchedule | null;
  /** Called with the edited schedule when an assignee is dragged to a new position. */
  onScheduleChange: (schedule: SectionSchedule) => void;
}

export default function ActivityGrid(props: ActivityGridProps) {
  const { sessionId, sectionId, draftSchedule, onScheduleChange } = props;
  const sectionQuery = useSection(sessionId, sectionId);
  const scheduleQuery = useSectionSchedule(
    sessionId,
    sectionId,
    sectionQuery.data && isSchedulingSection(sectionQuery.data),
  );
  const attendeesQuery = useAttendeeList(sessionId);

  if (sectionQuery.data && !isSchedulingSection(sectionQuery.data)) {
    return <p>Not a scheduling section</p>;
  } else if (sectionQuery.isError) {
    return <p>Error loading section</p>;
  } else if (!draftSchedule && scheduleQuery.isError) {
    return isNotFoundError(scheduleQuery.error) ? (
      <p>No schedule has been generated for this section yet.</p>
    ) : (
      <p>Error loading schedule</p>
    );
  } else if (attendeesQuery.isError) {
    return <p>Error loading attendees</p>;
  }

  const schedule = draftSchedule ?? scheduleQuery.data;
  if (sectionQuery.isPending || attendeesQuery.isPending || !schedule) {
    return <LoadingPage />;
  }
  return (
    <ActivityGridContent
      schedule={schedule}
      section={sectionQuery.data}
      attendees={attendeesQuery.data}
      onScheduleChange={onScheduleChange}
      hasUnsavedChanges={!!draftSchedule}
    />
  );
}

interface ActivityGridContentProps {
  schedule: SectionSchedule;
  section: SchedulingSection;
  attendees: Attendee[];
  onScheduleChange: (schedule: SectionSchedule) => void;
  hasUnsavedChanges: boolean;
}

export function ActivityGridContent(props: ActivityGridContentProps) {
  const { schedule, section, attendees, onScheduleChange, hasUnsavedChanges } = props;

  const attendeeGroups = useMemo(
    () => getAttendeeGroups(attendees),
    [attendees],
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    const updatedSchedule = moveAssignment(
      schedule,
      { listId: source.droppableId, index: source.index },
      { listId: destination.droppableId, index: destination.index },
    );
    if (updatedSchedule !== schedule) {
      onScheduleChange(updatedSchedule);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <SimpleGrid className="grid-cols-[minmax(20px,60px)_20px_20px_minmax(0px,3fr)_20px] gap-0 border border-neutral-5">
        <Box className="col-start-1 col-end-6 bg-neutral-3 border border-neutral-5">
          Options
        </Box>
        {getBlocksInOrder(schedule.blocks).map(([blockId, block], i) => (
          <ActivityGridRow
            key={blockId}
            index={getBlockIndexFromNum(i)}
            blockId={blockId}
            block={block}
            section={section}
            attendeeGroups={attendeeGroups}
            isAddActivityDisabled={hasUnsavedChanges}
          />
        ))}
      </SimpleGrid>
    </DragDropContext>
  );
}
