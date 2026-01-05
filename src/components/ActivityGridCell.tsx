import { Block, SchedulingSectionType } from "@/types/sessionTypes";
import {
  Box,
  Flex,
  Text,
  useMantineTheme,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import React, { useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface ActivityGridCellProps {
  block: Block<SchedulingSectionType>;
  id: string;
}

export const ActivityGridCell: React.FC<ActivityGridCellProps> = ({
  block,
  id,
}) => {

  return (
    <>
      <Text className="flex justify-center items-center w-full h-full p-0 border-[1px] border-solid border-neutral-5 bg-neutral-2 text-sm font-semibold">
        Block {id}
      </Text>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border-[1px] border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
      >
        <IconChevronLeft size={24} />
      </ActionIcon>
      <ScrollArea className="w-full">
        <Flex>
          {block.activities.map((activity, i) => (
            <Box key={i} style={{ minWidth: 200, maxWidth: 200 }}>
              <ActivityCard activity={activity} />
            </Box>
          ))}
        </Flex>
      </ScrollArea>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border-[1px] border-solid border-neutral-5",
        }}
        variant="subtle"
        size="xs"
      >
        <IconChevronRight size={24} />
      </ActionIcon>
    </>
  );
};
