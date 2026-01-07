"use client";

import { SchedulingSectionType, SectionScheduleID } from "@/types/sessionTypes";
import React from "react";
import ActivityGridRow from "./ActivityGridRow";
import { Box, SimpleGrid } from "@mantine/core";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import LoadingPage from "@/app/loading";

interface ActivityGridProps {
  sessionId: string;
  sectionId: string;
}

export default function ActivityGrid(props: ActivityGridProps) {
  const { sessionId, sectionId } = props;
  const scheduleQuery = useSectionSchedule(sessionId, sectionId);

  if (scheduleQuery.isError) return <p>Error loading schedule</p>
  else if (scheduleQuery.isPending) return <LoadingPage />;
  return <ActivityGridContent schedule={scheduleQuery.data} />
}

interface ActivityGridContentProps {
  schedule: SectionScheduleID<SchedulingSectionType>;
}

export function ActivityGridContent(props: ActivityGridContentProps) {
  const { schedule } = props;

  return (
    <SimpleGrid className="grid-cols-[minmax(20px,60px)_20px_minmax(0px,_3fr)_20px] gap-0 border-[1px] border-netural-5">
      <Box className="col-start-1 col-end-5 bg-neutral-3 border-[1px] border-neutral-5">
        Options
      </Box>
      {Object.keys(schedule.blocks)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((blockId) => (
          <ActivityGridRow
            key={blockId}
            id={blockId}
            block={schedule.blocks[blockId]}
          />
        ))}
    </SimpleGrid>
  );
}
