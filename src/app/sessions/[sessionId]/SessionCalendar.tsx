import { Moment, weekdaysShort } from "moment";

import React, { JSX, useState } from "react";
import { Grid, Text, Box, Badge } from "@mantine/core";
import { SessionID } from "@/types/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import { modals } from "@mantine/modals";
import EditSectionModal from "@/components/EditSectionModal";
import useSectionsBySessionId from "@/hooks/sections/useSectionsBySessionId";

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

  const badges: JSX.Element[] = [];
  (sections || []).forEach((section) => {
    const weekIndex = weekStarts.findIndex((weekStart) => weekStart.isSameOrBefore(section.startDate) && moment(section.endDate).isSameOrBefore(weekStart.clone().add(1, 'week')));
    const numDays = moment(section.startDate).startOf('day').diff(moment(section.endDate).startOf('day'), 'day');
    badges.push(<Grid.Col span={numDays + 1}><Badge>{section.name}</Badge></Grid.Col>);
  })

  return (
    <Grid columns={7} className="grid-cols-7 gap-0 select-none">
      {weekdaysShort().map((day) => (
        <Grid.Col
          span={1}
          key={day}
          className="p-xs bg-neutral-0 border-[1px] border-solid border-neutral-5"
        >
          <Text className="text-sm text-center font-bold">{day}</Text>
        </Grid.Col>
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
            <Grid.Col
              span={1}
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
            </Grid.Col>
          );
        })
      )}
      {badges}
    </Grid>
  );
}
