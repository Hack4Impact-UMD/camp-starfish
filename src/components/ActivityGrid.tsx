"use client";

import {
  Block,
  SchedulingSectionType,
  SectionScheduleID,
} from "@/types/sessionTypes";
import React, { useState } from "react";

import { ActivityGridCell } from "./ActivityGridCell";

import {
  Box,
  Button,
  Container,
  Flex,
  ScrollArea,
  Select,
  SimpleGrid,
  Table,
  TextInput,
  useMantineTheme,
} from "@mantine/core";

interface ActivityGridProps {
  sectionSchedule: SectionScheduleID<SchedulingSectionType>;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({
  sectionSchedule,
}) => {
  return (
    <SimpleGrid className="grid-cols-[minmax(20px,60px)_20px_minmax(0px,_3fr)_20px] gap-0 border-[1px] border-netural-5">
      <Box className="col-start-1 col-end-5 bg-neutral-3 border-[1px] border-neutral-5">
        Options
      </Box>
      {Object.keys(sectionSchedule.blocks)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((blockId) => (
          <ActivityGridCell
            key={blockId}
            id={blockId}
            block={sectionSchedule.blocks[blockId]}
          />
        ))}
    </SimpleGrid>
  );
};
