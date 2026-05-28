import { Moment, weekdaysShort } from "moment";

import React, { useState } from "react";
import {
  SimpleGrid,
  Text,
  Box,
  Menu,
  Button,
  ActionIcon,
  Select,
  Title,
} from "@mantine/core";
import { Session } from "@/types/sessions/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import openEditSectionModal from "@/components/EditSectionModal";
import { MonthView, Schedule, ScheduleHeader } from "@mantine/schedule";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { getMonthDays } from "@mantine/dates";

function momentRangesOverlap(range1: [Moment, Moment], range2: [Moment, Moment]): boolean {
  return range1[0].isBefore(range2[1]) && range1[1].isAfter(range2[0]);
}

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

  const [selectedMonth, setSelectedMonth] = useState<Moment>(
    moment(session.startDate).startOf("month"),
  );

  return (
    <div>
      <ScheduleHeader className="flex items-center">
        <ActionIcon
          variant="outline"
          size="md"
          onClick={() =>
            setSelectedMonth((prev) => prev.clone().subtract(1, "month"))
          }
          disabled={selectedMonth.isSame(session.startDate, "month")}
        >
          <MdChevronLeft size={20} />
        </ActionIcon>
        <ActionIcon
          variant="outline"
          size="md"
          onClick={() =>
            setSelectedMonth((prev) => prev.clone().add(1, "month"))
          }
          disabled={selectedMonth.isSame(session.endDate, "month")}
        >
          <MdChevronRight size={20} />
        </ActionIcon>
        <Title order={4}>{selectedMonth.format("MMMM YYYY")}</Title>
      </ScheduleHeader>
      <MonthView
        date={selectedMonth.toDate()}
        classNames={{
          monthViewInner: "rounded-none",
          monthViewWeek: "rounded-none",
          monthViewWeekday:
            "rounded-none border border-solid border-neutral bg-neutral-0",
        }}
        getDayProps={(date) => {
          const isInSession = moment(date).isBetween(
            session.startDate,
            session.endDate,
            "day",
            "[]",
          );
          const isInWeekWithSessionDate = momentRangesOverlap([moment(session.startDate), moment(session.endDate)], [moment(date).startOf('week'), moment(date).startOf('week').add(6, 'days')])
          return {
            className: classNames(
              "rounded-none border border-solid border-neutral",
              {
                "bg-neutral-2 cursor-pointer": isInSession,
                "bg-neutral-3 cursor-default text-transparent": !isInSession,
                "hidden": !isInWeekWithSessionDate,
                "text-black": moment(date).isSame(selectedMonth, "month") && isInSession,
              },
            ),
          };
        }}
        consistentWeeks={false}
        withHeader={false}
        highlightToday={false}
        firstDayOfWeek={0}
      />
    </div>
  );
}
