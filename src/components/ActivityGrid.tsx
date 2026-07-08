"use client";

import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { Attendee, SchedulingSection } from "@/types/sessions/sessionTypes";
import React, { useMemo } from "react";
import ActivityGridRow from "@/components/ActivityGridRow";
import { Box, SimpleGrid } from "@mantine/core";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import useListAttendees from "@/hooks/attendees/useListAttendees";
import LoadingPage from "@/app/loading";
import { isNotFoundError } from "@/data/firestore/firestoreClientOperations";
import { getAttendeeGroups } from "@/features/scheduling/generation/schedulingUtils";

interface ActivityGridProps {
  sessionId: string;
  section: SchedulingSection;
}

export default function ActivityGrid(props: ActivityGridProps) {
  const { sessionId, section } = props;
  const scheduleQuery = useSectionSchedule(sessionId, section.id);
  const attendeesQuery = useListAttendees(sessionId);

  if (scheduleQuery.isError) {
    return isNotFoundError(scheduleQuery.error) ? (
      <p>No schedule has been generated for this section yet.</p>
    ) : (
      <p>Error loading schedule</p>
    );
  } else if (attendeesQuery.isError) {
    return <p>Error loading attendees</p>;
  } else if (scheduleQuery.isPending || attendeesQuery.isPending) {
    return <LoadingPage />;
  }
  return (
    <ActivityGridContent
      schedule={scheduleQuery.data}
      section={section}
      attendees={attendeesQuery.data}
    />
  );
}

interface ActivityGridContentProps {
  schedule: SectionSchedule;
  section: SchedulingSection;
  attendees: Attendee[];
}

export function ActivityGridContent(props: ActivityGridContentProps) {
  const { schedule, section, attendees } = props;

  const attendeeGroups = useMemo(() => getAttendeeGroups(attendees), [attendees]);

  return (
    <SimpleGrid className="grid-cols-[minmax(20px,60px)_20px_minmax(0px,3fr)_20px] gap-0 border border-neutral-5">
      <Box className="col-start-1 col-end-5 bg-neutral-3 border border-neutral-5">
        Options
      </Box>
      {Object.keys(schedule.blocks)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((blockId) => (
          <ActivityGridRow
            key={blockId}
            id={blockId}
            block={schedule.blocks[blockId]}
            section={section}
            attendeeGroups={attendeeGroups}
          />
        ))}
    </SimpleGrid>
  );
}
