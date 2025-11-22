import { Moment, weekdaysShort } from "moment";

import React, { useState } from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import { SessionID } from "@/types/sessionTypes";
import moment from "moment";

interface CalendarViewProps {
  session: SessionID;
}

export default function CalendarView({ session }: CalendarViewProps) {
  const [firstSelectedDate, setFirstSelectedDate] = useState<Moment | null>(
    null
  );
  const [secondSelectedDate, setSecondSelectedDate] = useState<Moment | null>(null);

  const handleMouseDown = (date: Moment) => {
    setFirstSelectedDate(date);
    setSecondSelectedDate(date);
  };

  const isSelecting = firstSelectedDate !== null;
  const handleMouseEnter = (date: Moment) => {
    if (isSelecting) {
      setSecondSelectedDate(date);
    }
  };

  const handleMouseUp = (date: Moment) => {
    if (isSelecting) {
      // TODO: integrate Create Section modal
      console.log('open create section modal from ', firstSelectedDate?.format("YYYY-MM-DD"), 'to', secondSelectedDate?.format("YYYY-MM-DD"));
    }
    setFirstSelectedDate(null);
    setSecondSelectedDate(null);
  };

  const weekStarts = [moment(session.startDate).startOf("week")];
  const startOfLastWeek = moment(session.endDate).clone().startOf("week");
  while (weekStarts[weekStarts.length - 1].isBefore(startOfLastWeek)) {
    weekStarts.push(weekStarts[weekStarts.length - 1].clone().add(1, "week"));
  }

  return (
    <div className="select-none">
      <SimpleGrid cols={7} spacing={0}>
        {weekdaysShort().map((day) => (
          <Box key={day} p="xs" bg="#f5f5f5" bd="1px solid neutral.5">
            <Text fs="sm" ta="center" fw="bold" fz={"sm"}>
              {day}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
      {weekStarts.map((weekStart) => (
        <SimpleGrid key={weekStart.format("YYYY-MM-DD")} cols={7} spacing={0}>
          {Array.from({ length: 7 }, (_, i) =>
            weekStart.clone().add(i, "day")
          ).map((day) => {
            const isInSession = day.isBetween(
              session.startDate,
              session.endDate,
              "day",
              "[]"
            );
            const isInSelection =
              firstSelectedDate &&
              secondSelectedDate &&
              day.isBetween(
                firstSelectedDate.isSameOrBefore(secondSelectedDate)
                  ? firstSelectedDate
                  : secondSelectedDate,
                firstSelectedDate.isSameOrBefore(secondSelectedDate)
                  ? secondSelectedDate
                  : firstSelectedDate,
                "day",
                "[]"
              );

            const eventHandlers = isInSession && {
              onMouseDown: () => handleMouseDown(day),
              onMouseEnter: () => handleMouseEnter(day),
              onMouseUp: () => handleMouseUp(day),
            };

            return (
              <Box
                key={day.format("YYYY-MM-DD")}
                {...eventHandlers}
                p="xs"
                bg={
                  isInSession
                    ? isInSelection
                      ? "accent-blue"
                      : "neutral.2"
                    : "neutral.3"
                }
                bd="1px solid neutral.5"
                display="flex"
                h={200}
              >
                <Text size="sm" fw={"bold"} ta={"center"}>
                  {day.date()}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      ))}
    </div>
  );
}
