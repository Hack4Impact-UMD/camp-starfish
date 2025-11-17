import {
  Block,
  BlockActivities,
  SchedulingSectionType,
} from "@/types/sessionTypes";
import {
  Box,
  Center,
  Container,
  Flex,
  ScrollArea,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
import React from "react";
import { ActivityCard } from "./ActivityCard";

import { Carousel } from "@mantine/carousel";

interface ActivityGridCellProps {
  block: Block<SchedulingSectionType>;
  id: string;
}

export const ActivityGridCell: React.FC<ActivityGridCellProps> = ({
  block,
  id,
}) => {
  const theme = useMantineTheme();
  return (
    <>
      <Container
        style={{
          border: `1px solid ${theme.colors["neutral"][5]}`,
        }}
      >
        <Flex gap="md" align="flex-start">
          <Box w={120}>
            <Text>Block {id}</Text>
          </Box>

          <ScrollArea scrollbarSize={4}>
            <Flex>
              {block.activities.map((activity, i) => (
                <Box key={i}>
                  <ActivityCard id={i + 1} activity={activity} />
                </Box>
              ))}
            </Flex>
          </ScrollArea>
        </Flex>
      </Container>
    </>
  );
};
