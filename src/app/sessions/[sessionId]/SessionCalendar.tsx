import { Moment, weekdaysShort } from "moment";

import React, { useState } from "react";
import { SimpleGrid, Text, Box, Menu, Button, ActionIcon, Select, Title } from "@mantine/core";
import { Session } from "@/types/sessions/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import openEditSectionModal from "@/components/EditSectionModal";
import { MonthView, Schedule, ScheduleHeader } from "@mantine/schedule";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { getMonthDays } from "@mantine/dates";

interface SessionCalendarProps {
  session: Session;
}

export default function SessionCalendar({ session }: SessionCalendarProps) {
  const [firstSelectedDate, setFirstSelectedDate] = useState<Moment | null>(
    null,
  );
  const [secondSelectedDate, setSecondSelectedDate] = useState<Moment | null>(
    null,
  );

  const handlePointerDown = (date: Moment) => {
    setFirstSelectedDate(date);
    setSecondSelectedDate(date);
  };

  const isSelecting = firstSelectedDate !== null && secondSelectedDate !== null;
  const handlePointerEnter = (date: Moment) => {
    if (isSelecting) {
      setSecondSelectedDate(date);
    }
  };

  const handlePointerUp = () => {
    if (isSelecting) {
      openEditSectionModal({
        sessionId: session.id,
        initialStartDate: firstSelectedDate,
        initialEndDate: secondSelectedDate,
      });
    }
    setFirstSelectedDate(null);
    setSecondSelectedDate(null);
  };

  const weekStarts = [moment(session.startDate).startOf("week")];
  const lastWeekStart = moment(session.endDate).clone().startOf("week");
  while (weekStarts[weekStarts.length - 1].isBefore(lastWeekStart)) {
    weekStarts.push(weekStarts[weekStarts.length - 1].clone().add(1, "week"));
  }

  const [selectedMonth, setSelectedMonth] = useState<Moment>(moment(session.startDate).startOf('month'));

  return (
    <>
      <div>
        <ScheduleHeader className="flex items-center">
          <ScheduleHeader.Previous onClick={() => setSelectedMonth(prev => prev.clone().subtract(1, 'month'))}/>
          <ScheduleHeader.Next onClick={() => setSelectedMonth(prev => prev.clone().add(1, 'month'))}/>
          <Title order={4}>{selectedMonth.format("MMMM YYYY")}</Title>
        </ScheduleHeader>
        <MonthView
                date={selectedMonth.toDate()}
          classNames={{
            monthViewInner: 'rounded-none',
            monthViewWeek: 'rounded-none',
            monthViewWeekday: 'rounded-none border border-solid border-neutral bg-neutral-0',
          }}
          getDayProps={(date) => {
            const isInSession = moment(date).isBetween(session.startDate, session.endDate, "day", "[]");
            return {
              className: classNames('rounded-none border border-solid border-neutral text-black', {
                "bg-neutral-2": isInSession,
                "bg-neutral-3": !isInSession
              })
            }
          }}
          withHeader={false}
        />
      </div>
      <SimpleGrid className="grid-cols-7 gap-0 select-none w-full">
        {weekdaysShort().map((day) => (
          <Box
            key={day}
            className="p-xs bg-neutral-0 border border-solid border-neutral-5"
          >
            <Text className="text-sm text-center font-bold">{day}</Text>
          </Box>
        ))}
        {weekStarts.map((weekStart) =>
          Array.from({ length: 7 }, (_, i) =>
            weekStart.clone().add(i, "day"),
          ).map((day) => {
            const isInSession = day.isBetween(
              session.startDate,
              session.endDate,
              "day",
              "[]",
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
                "[]",
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
                  "p-xs border border-solid border-neutral-5 text-left min-h-52",
                  {
                    "bg-aqua-4": isInSession && isInSelection,
                    "bg-neutral-2": isInSession && !isInSelection,
                    "bg-neutral-3": !isInSession,
                  },
                )}
              >
                <Text className="text-sm font-bold text-center">
                  {day.date()}
                </Text>
              </Box>
            );
          }),
        )}
      </SimpleGrid>
    </>
  );
}
