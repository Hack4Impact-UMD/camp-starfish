import {
  BundleActivity,
  BunkAssignments,
  IndividualAssignments,
  JamboreeActivity,
} from "@/types/sessionTypes";
import { Box, Card, Flex, Title, Text } from "@mantine/core";
import React from "react";

type AnyBlockActivity =
  | (BundleActivity & { assignments: IndividualAssignments })
  | (JamboreeActivity & { assignments: IndividualAssignments })
  | (JamboreeActivity & { assignments: BunkAssignments });

interface ActivityCardProps {
  id: number;
  assignments: AnyBlockActivity;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  assignments,
}) => {
  return (
    <>
      <Box>Activity: {id}</Box>

      <Card>
        <Flex gap="md">
          {"staffIds" in assignments && (
            <Box>
              <Title order={5}>Staff</Title>
              {assignments.staffIds.map((staffID) => (
                <Text key={staffID}>{staffID}</Text>
              ))}
            </Box>
          )}

          {"camperIds" in assignments && (
            <Box>
              <Title order={5}>Campers</Title>
              {assignments.camperIds.map((camperID) => (
                <Text key={camperID}>{camperID}</Text>
              ))}
            </Box>
          )}

          {"bunkNums" in assignments && (
            <Box>
              <Title order={5}>Bunks</Title>
              {assignments.bunkNums.map((bunkNum) => (
                <Text key={bunkNum}>{bunkNum}</Text>
              ))}
            </Box>
          )}
        </Flex>
      </Card>
    </>
  );
};
