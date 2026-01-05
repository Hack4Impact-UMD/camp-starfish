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
  const theme = useMantineTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 7;

  const totalPages = Math.ceil(block.activities.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, block.activities.length);
  const currentActivities = block.activities.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <>
      <Text className="flex justify-center items-center w-full h-full p-0 border-[1px] border-solid border-neutral-5 bg-neutral-2 text-sm font-semibold">
        Block {id}
      </Text>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border-[1px] border-solid border-neutral-5",
        }}
        onClick={handlePrevPage}
        variant="subtle"
        size="xs"
      >
        <IconChevronLeft size={24} />
      </ActionIcon>
      <ScrollArea className="w-full">
        <Flex>
          {currentActivities.map((activity, i) => (
            <Box key={startIndex + i} style={{ minWidth: 200, maxWidth: 200 }}>
              <ActivityCard id={startIndex + i + 1} activity={activity} />
            </Box>
          ))}
        </Flex>
      </ScrollArea>
      <ActionIcon
        classNames={{
          root: "w-full h-full rounded-none border-[1px] border-solid border-neutral-5",
        }}
        onClick={handlePrevPage}
        variant="subtle"
        size="xs"
      >
        <IconChevronRight size={24} />
      </ActionIcon>
    </>
  );
};
