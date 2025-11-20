import { Moment } from "moment";
import React, { useState, useEffect } from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import { CalendarViewDay } from "./CalendarViewDay";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

interface CalendarViewProps {
  sessionStartDate: Moment;
  sessionEndDate: Moment;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessionStartDate,
  sessionEndDate,
}) => {
  const start = sessionStartDate.clone().startOf("week");
  const end = sessionEndDate.clone().endOf("week");

  const [isDragging, setIsDragging] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startIndex, setStartIndex] = useState<number | null>(null);

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

  const handleMouseDown = (index: number) => {
    setIsDragging(true);
    setStartIndex(index);
    setSelectedDays([index]);
  };

  const handleMouseEnter = (index: number) => {
    // handles mouse entering different cells
    if (isDragging && startIndex != null) {
      const min = Math.min(startIndex, index);
      const max = Math.max(startIndex, index);

      const range = Array.from({ length: max - min + 1 }, (_, i) => min + i); //gets all the cells from the start index to the index the mouse is on
      setSelectedDays(range);
    }
  };

  const handleMouseUp = () => {
    //when mouse is lifted
    if (isDragging && selectedDays.length > 1) {
      const start = days[selectedDays[0]];
      const end = days[selectedDays[selectedDays.length - 1]];
      console.log(
        "Create event from",
        start.format("MM-DD"),
        "to",
        end.format("MM-DD")
      );
      // OPEN MODULE HERE
      // need to add logic where after this module closes, clear selected days
    }
    setIsDragging(false);
    setStartIndex(null);
  };
  return (
    // need the userselect none to make dragging possible
    <QueryClientProvider client={queryClient}>
      <div style={{ userSelect: "none" }}>
        <SimpleGrid cols={7} spacing={0}>
          {daysOfWeek.map((day) => (
            <Box key={day} p="xs" bg="#f5f5f5" bd="1px solid neutral.5">
              <Text fs="sm" ta="center" fw="bold" fz={"sm"}>
                {day}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
        {weeks.map((week, weekIdx) => (
          <SimpleGrid key={weekIdx} cols={7} spacing={0}>
            {week.map((day, dayIdx) => {
              const flatIndex = weekIdx * 7 + dayIdx;
              return (
                <Box
                  key={day.format("YYYY-MM-DD")}
                  onMouseDown={() => handleMouseDown(flatIndex)}
                  onMouseEnter={() => handleMouseEnter(flatIndex)}
                  onMouseUp={handleMouseUp}
                >
                  <CalendarViewDay
                    inRange={
                      day.isSameOrAfter(sessionStartDate, "day") &&
                      day.isSameOrBefore(sessionEndDate, "day")
                    }
                    isSelected={selectedDays.includes(flatIndex)}
                    day={day}
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        ))}
      </div>
    </QueryClientProvider>
  );
};
