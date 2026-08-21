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

interface ActivityGridProps {
  sessionId: string;
  sectionId: string;
}

export default function ActivityGrid(props: ActivityGridProps) {
  const { sessionId, sectionId } = props;
  const sectionQuery = useSection(sessionId, sectionId);
  const scheduleQuery = useSectionSchedule(sessionId, sectionId, sectionQuery.data && isSchedulingSection(sectionQuery.data));
  const attendeesQuery = useAttendeeList(sessionId);

  if (sectionQuery.data && !isSchedulingSection(sectionQuery.data)) {
    return <p>Not a scheduling section</p>;
  } else if (sectionQuery.isError) {
    return <p>Error loading section</p>;
  } else if (scheduleQuery.isError) {
    return isNotFoundError(scheduleQuery.error) ? (
      <p>No schedule has been generated for this section yet.</p>
    ) : (
      <p>Error loading schedule</p>
    );
  } else if (attendeesQuery.isError) {
    return <p>Error loading attendees</p>;
  } else if (sectionQuery.isPending || scheduleQuery.isPending || attendeesQuery.isPending) {
    return <LoadingPage />;
  }
  return (
    <ActivityGridContent
      schedule={scheduleQuery.data}
      section={sectionQuery.data}
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
    <SimpleGrid className="grid-cols-[minmax(20px,60px)_20px_20px_minmax(0px,3fr)_20px] gap-0 border border-neutral-5">
      <Box className="col-start-1 col-end-6 bg-neutral-3 border border-neutral-5">
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
