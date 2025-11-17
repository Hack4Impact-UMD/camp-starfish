import {
  Block,
  BlockActivities,
  SchedulingSectionType,
} from "@/types/sessionTypes";
import {
  Box,
  Container,
  Flex,
  ScrollArea,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
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
  const theme = useMantineTheme();
  return (
    <>
      <Container fluid>
        <Flex gap="md" align="flex-start">
          <Box w={120}>
            <Text>Block {id}</Text>
          </Box>

          <Box>
            <ScrollArea w="100%" offsetScrollbars>
              <SimpleGrid cols={3} spacing={0}>
                {block.activities.map((activity, index) => (
                  <ActivityCard key={index} id={index} activity={activity} />
                ))}
              </SimpleGrid>
            </ScrollArea>
          </Box>
        </Flex>
      </Container>
    </>
  );
};
