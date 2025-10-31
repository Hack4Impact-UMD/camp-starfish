import { Box } from "@mantine/core";
import { Moment } from "moment";
import React from "react";
import { Text } from "@mantine/core";

interface CalendarViewDayProps {
  inRange: boolean;
  day: Moment;
  isSelected: boolean;
}

export const CalendarViewDay: React.FC<CalendarViewDayProps> = ({
  inRange,
  day,
  isSelected,
}) => {
  return (
    <Box
      key={day.toString()}
      p="xs"
      bg={inRange ? (isSelected ? "accent-blue" : "neutral.2") : "neutral.3"}
      bd="1px solid neutral.5"
      display="flex"
      h={200}
    >
      <Text size="sm" fw={"bold"} ta={"center"}>
        {day.date()}
      </Text>
    </Box>
  );
};
