"use client";

import { Moment, weekdaysShort } from "moment";
import React, { JSX, useState } from "react";
import { SimpleGrid, Text, Box, Grid, Badge } from "@mantine/core";
import moment from "moment";
import classNames from "classnames";
import { modals } from "@mantine/modals";
import EditSectionModal from "@/components/EditSectionModal";
import { SessionID } from "@/types/sessionTypes";
import useSectionsBySessionId from "@/hooks/sections/useSectionsBySessionId";
import { useRouter } from "next/navigation";
interface SessionCalendarProps {
  session: SessionID;
}

export default function SessionCalendar({ session }: SessionCalendarProps) {
  const [firstSelectedDate, setFirstSelectedDate] = useState<Moment | null>(
    null
  );
  const [secondSelectedDate, setSecondSelectedDate] = useState<Moment | null>(
    null
  );

  const { data: sections } = useSectionsBySessionId(session.id);

  const router = useRouter();

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
      modals.open({
        title: "Create Section",
        children: (
          <EditSectionModal
            selectedStartDate={
              firstSelectedDate.isSameOrBefore(secondSelectedDate)
                ? firstSelectedDate
                : secondSelectedDate
            }
            selectedEndDate={
              firstSelectedDate.isSameOrBefore(secondSelectedDate)
                ? secondSelectedDate
                : firstSelectedDate
            }
            sessionId={session.id}
          />
        ),
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

  return (
    <SimpleGrid className="grid-cols-7 gap-0 select-none min-w-[894px] flex-grow">
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

          const section = sections?.find(
            (s) =>
              moment(s.startDate).isSameOrBefore(day) &&
              day.isSameOrBefore(s.endDate)
          );

          return (
            <Box
              key={day.format("YYYY-MM-DD")}
              {...eventHandlers}
              className={classNames(
                "p-xs border-[1px] border-solid border-neutral-5 text-left min-h-52",
                {
                  "bg-aqua-4": isInSession && isInSelection,
                  "bg-neutral-2": isInSession && !isInSelection,
                  "bg-neutral-3": !isInSession,
                }
              )}
            >
              <Text className="text-sm font-bold text-center">
                {day.date()}
              </Text>
              {section && (
                <Badge
                  onClick={(e) => {
                    router.push(`/sessions/${session.id}/${section.id}`);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerEnter={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                >
                  {section?.name ?? ""}
                </Badge>
              )}
            </Box>
          );
        })
      )}
    </SimpleGrid>
  );
}
