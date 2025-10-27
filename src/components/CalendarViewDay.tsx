import { Box } from "@mantine/core";
import { Moment } from "moment";
import React from "react";
import { Text } from "@mantine/core";

interface CalendarViewDayProps {
  inRange: boolean;
  day: Moment;
}

export const CalendarViewDay: React.FC<CalendarViewDayProps> = ({
  inRange,
  day,
}) => {
  return (
    <Box
      key={day.toString()}
      p="xs"
      bg={inRange ? "#fff" : "#e0e0e0"}
      bd="1px solid #ccc"
      display="flex"
      h={200}
    >
      <Text size="sm" fw={inRange ? "bold" : "normal"}>
        {day.date()}
      </Text>
    </Box>
  );
};
