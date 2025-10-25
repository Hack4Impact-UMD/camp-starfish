import { Moment } from "moment";
import React from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import { CalanderViewDay } from "./CalanderViewDay";

interface CalanderViewProps {
  sessionStartDate: Moment;
  sessionEndDate: Moment;
}

export const CalanderView: React.FC<CalanderViewProps> = ({
  sessionStartDate,
  sessionEndDate,
}) => {
  const start = sessionStartDate.clone().startOf("week");
  const end = sessionEndDate.clone().endOf("week");

  const days: Moment[] = [];
  let curr = start.clone();
  while (curr.isBefore(end) || curr.isSame(end, "day")) {
    days.push(curr.clone());
    curr.add(1, "day");
  }

  const weeks: Moment[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const daysOfWeek: string[] = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
  ];

  return (
    <div>
      <SimpleGrid cols={7} spacing={0}>
        {daysOfWeek.map((day) => (
          <Box key={day} p="xs" bg="#f5f5f5" bd="1px solid #ccc">
            <Text fs="sm" ta="center" fw="bold" fz={"sm"}>
              {day}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
      {weeks.map((week, idx) => (
        <SimpleGrid key={idx} cols={7} spacing={0}>
          {week.map((day) => (
            <CalanderViewDay
              key={day.toString()}
              inRange={
                day.isSameOrAfter(sessionStartDate, "day") &&
                day.isSameOrBefore(sessionEndDate, "day")
              }
              day={day}
            />
          ))}
        </SimpleGrid>
      ))}
    </div>
  );
};
