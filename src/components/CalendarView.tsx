import { Moment, weekdaysShort } from "moment";

import React, { useState } from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import { CalendarViewDay } from "./CalendarViewDay";
import { SessionID } from "@/types/sessionTypes";
import moment from "moment";

interface CalendarViewProps {
  session: SessionID;
}

export default function CalendarView({ session }: CalendarViewProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<Moment | null>(
    null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Moment | null>(null);

  const isDateInSession = (date: Moment): boolean =>
    date.isSameOrAfter(session.startDate) &&
    date.isSameOrBefore(session.endDate);

  const handleMouseDown = (date: Moment) => {
    setSelectedStartDate(date);
  };

  const isDragging = selectedStartDate !== null;
  const handleMouseEnter = (date: Moment) => {
    if (isDragging) {
      if (date.isBefore(selectedStartDate)) {
        setSelectedStartDate(date);
        setSelectedEndDate(selectedStartDate);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  const handleMouseUp = () => {
    // TODO: implement Create Section modal
    console.log("modal opened");
  };

  const weekStarts = [moment(session.startDate).startOf("week")];
  while (weekStarts[weekStarts.length - 1].isBefore(session.endDate)) {
    weekStarts.push(weekStarts[weekStarts.length - 1].clone().add(1, "week"));
  }

  return (
   // need the userselect none to make dragging possible
    <div style={{ userSelect: "none" }}>
      <SimpleGrid cols={7} spacing={0}>
        {weekdaysShort().map((day) => (
          <Box key={day} p="xs" bg="#f5f5f5" bd="1px solid neutral.5">
            // {/* <Text fs="sm" ta="center" fw="bold" fz={"sm"}> */}
              // {/* {day} */}
            // {/* </Text> */}
          // {/* </Box> */}
        ))}
      // {/* </SimpleGrid> */}
      // {/* {weeks.map((week, weekIdx) => ( */}
        <SimpleGrid key={weekIdx} cols={7} spacing={0}>
          // {/* {week.map((day, dayIdx) => { */}
            const flatIndex = weekIdx * 7 + dayIdx;
            return (
              <Box
                key={day.format("YYYY-MM-DD")}
                onMouseDown={() => handleMouseDown(flatIndex)}
                onMouseEnter={() => handleMouseEnter(flatIndex)}
                onMouseUp={handleMouseUp}
              >
                // {/* <CalendarViewDay */}
                  inRange={
                    day.isSameOrAfter(sessionStartDate, "day") &&
                    day.isSameOrBefore(sessionEndDate, "day")
                  }
                  isSelected={selectedDays.includes(flatIndex)}
                  day={day}
                />
              // {/* </Box> */}
            );
          })}
        // {/* </SimpleGrid> */}
      ))}
    // {/* </div> */}
  );
}
