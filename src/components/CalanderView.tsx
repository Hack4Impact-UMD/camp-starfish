import { Moment } from "moment";
import React from "react";
import { Text } from "@mantine/core";
import { Box } from "@mantine/core";
import { SimpleGrid } from "@mantine/core";
interface CalanderViewProps {
  sessionStartDate: Moment;
  sessionEndDate: Moment;
}

interface CalanderProps {}

export const CalanderView: React.FC<CalanderViewProps> = ({
  sessionStartDate,
  sessionEndDate,
}) => {
  const daysToDisplay: Moment[] = [];

  const currDate = sessionStartDate.clone();
  while (
    currDate.isBefore(sessionEndDate) ||
    currDate.isSame(sessionEndDate, "day")
  ) {
    daysToDisplay.push(currDate);
    currDate.add(1, "day");
  }

  const weeks: Moment[][] = [];
  for (let i = 0; i < daysToDisplay.length; i += 7) {
    weeks.push(daysToDisplay.slice(i, i + 7));
  }

  const isSameMonth =
    sessionStartDate.month() === sessionEndDate.month() &&
    sessionStartDate.year() === sessionEndDate.year();
  return (
    <div>
      <Text size="sm" fw={"md"}>Session Title</Text>
      <Text size="sm">
        {sessionStartDate.format("MMM D")} –{" "}
        {sessionEndDate.format("MMM D, YYYY")}
      </Text>

      {weeks.map((week, idx) => (
        <SimpleGrid key={idx} cols={7} spacing={0}>
          {week.map((day) => (
            <Box
              key={day.toString()}
              p="xs"
              style={{
                backgroundColor:
                  day.isBefore(sessionStartDate, "day") ||
                  day.isAfter(sessionEndDate, "day")
                    ? "#e0e0e0"
                    : "#fff",
                border: "1px solid #ccc",
                height: 50,
              }}
              onMouseDown={() => console.log("Drag start:", day.format())}
              onMouseMove={() => console.log("Dragging:", day.format())}
              onMouseUp={() => console.log("Drag end:", day.format())}
            >
              <Text size="sm" fw={"md"} ta={"center"}>{day.date()}</Text>
            </Box>
          ))}
        </SimpleGrid>
      ))}
    </div>
  );
};
