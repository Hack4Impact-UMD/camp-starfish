import {
  Block,
  BlockActivities,
  SchedulingSectionType,
} from "@/types/sessionTypes";
import { Box, Container, Flex, ScrollArea, Text } from "@mantine/core";
import React from "react";
import { ActivityCard } from "./ActivityCard";

interface ActivityGridCellProps {
  block: Block<SchedulingSectionType>;
  id: string;
}

export const ActivityGridCell: React.FC<ActivityGridCellProps> = ({
  block,
  id,
}) => {
  console.log(block);
  return (
    <>
      <Container fluid>
        <Flex gap="md" align="flex-start">
          <Box w={120}>
            <Text>Block {id}</Text>
          </Box>

          <Box style={{ flex: 1 }}>
            <ScrollArea dir="row">
              {block.activities.map((activity, index) => (
                <ActivityCard id={index} assignments={activity}/>
              ))}
            </ScrollArea>
          </Box>
        </Flex>
      </Container>
    </>
  );
};
