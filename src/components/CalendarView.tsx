import { Moment, weekdaysShort } from "moment";

import React, { useState } from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import { SessionID } from "@/types/sessionTypes";
import moment from "moment";
import classNames from "classnames";

interface CalendarViewProps {
  session: SessionID;
}

export default function CalendarView({ session }: CalendarViewProps) {
  const [firstSelectedDate, setFirstSelectedDate] = useState<Moment | null>(
    null
  );
  const [secondSelectedDate, setSecondSelectedDate] = useState<Moment | null>(
    null
  );

  const handlePointerDown = (date: Moment) => {
    setFirstSelectedDate(date);
    setSecondSelectedDate(date);
  };

  const isSelecting = firstSelectedDate !== null;
  const handlePointerEnter = (date: Moment) => {
    if (isSelecting) {
      setSecondSelectedDate(date);
    }
  };

  const handlePointerUp = () => {
    if (isSelecting) {
      // TODO: integrate Create Section modal
    }
    setFirstSelectedDate(null);
    setSecondSelectedDate(null);
  };

  const weekStarts = [moment(session.startDate).startOf("week")];
  const lastWeekStart = moment(session.endDate).clone().startOf("week");
  while (weekStarts[weekStarts.length - 1].isBefore(lastWeekStart)) {
    weekStarts.push(weekStarts[weekStarts.length - 1].clone().add(1, "week"));
  }

  return (
    <SimpleGrid className="grid-cols-7 gap-0 select-none">
      {weekdaysShort().map((day) => (
        <Box
          key={day}
          className="p-xs bg-neutral-0 border-[1px] border-solid border-neutral-5"
        >
          <Text className="text-sm text-center font-bold">{day}</Text>
        </Box>
      ))}
      {weekStarts.map((weekStart) =>
        Array.from({ length: 7 }, (_, i) =>
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
            onPointerDown: () => handlePointerDown(day),
            onPointerEnter: () => handlePointerEnter(day),
            onPointerUp: () => handlePointerUp(),
          };

          return (
            <Box
              key={day.format("YYYY-MM-DD")}
              {...eventHandlers}
              className={classNames(
                "p-xs border-[1px] border-solid border-neutral-5 text-left min-h-52",
                {
                  "bg-accent-blue-4": isInSession && isInSelection,
                  "bg-neutral-2": isInSession && !isInSelection,
                  "bg-neutral-3": !isInSession,
                }
              )}
            >
              <Text className="text-sm font-bold text-center">
                {day.date()}
              </Text>
            </Box>
          );
        })
      )}
    </SimpleGrid>
  );
}
