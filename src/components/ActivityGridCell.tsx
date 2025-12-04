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
    <Box

    >
      <Flex align="stretch">
        <Box
          style={{
            minWidth: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${theme.colors["neutral"][5]}`,
            backgroundColor: theme.colors["neutral"][2],
          }}
        >
          <Text fw={600} size="sm">
            Block {id}
          </Text>
        </Box>

        <Flex align="center">
          <ActionIcon
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            variant="subtle"
            size="xs"
            style={{
              height: "100%",
              borderRadius: 0,
              backgroundColor: "#FFFFFF",
              border: `1px solid ${theme.colors["neutral"][5]}`,

            }}
          >
            <IconChevronLeft size={24} />
          </ActionIcon>
        </Flex>

        <ScrollArea
          style={{
            flex: 1,
          }}
          styles={{
            scrollbar: {
              display: "none",
            },
          }}
        >
          <Flex wrap="nowrap">
            {currentActivities.map((activity, i) => (
              <Box
                key={startIndex + i}
                style={{ minWidth: 200, maxWidth: 200 }}
              >
                <ActivityCard id={startIndex + i + 1} activity={activity}/>
              </Box>
            ))}
          </Flex>
        </ScrollArea>

        <Flex align="center">
          <ActionIcon
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            variant="subtle"
            size="xs"
            style={{
              height: "100%",
              borderRadius: 0,
              backgroundColor: "#FFFFFF",
              border: `1px solid ${theme.colors["neutral"][5]}`,

            }}
          >
            <IconChevronRight size={24} />
          </ActionIcon>
        </Flex>
      </Flex>
    </Box>
  );
};
