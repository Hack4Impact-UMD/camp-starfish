import { Moment } from "moment";
import { useMemo, useState } from "react";
import {
  ActionIcon,
  Title,
} from "@mantine/core";
import { Session } from "@/types/sessions/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import openEditSectionModal from "@/components/EditSectionModal";
import { MonthView, ScheduleHeader } from "@mantine/schedule";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { momentRangesOverlap } from "@/utils/timeUtils";

interface SessionCalendarProps {
  session: Session;
}

export default function SessionCalendar({ session }: SessionCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<Moment>(
    moment(session.startDate).startOf("month"),
  );
  const [firstSelectedDate, setFirstSelectedDate] = useState<Moment | null>(
    null,
  );
  const [secondSelectedDate, setSecondSelectedDate] = useState<Moment | null>(
    null,
  );

  const selectedDates = useMemo(() => {
    if (!firstSelectedDate || !secondSelectedDate) {
      return null;
    }
    const startDate = firstSelectedDate.isBefore(secondSelectedDate) ? firstSelectedDate : secondSelectedDate;
    const endDate = startDate === firstSelectedDate ? secondSelectedDate : firstSelectedDate;
    return [startDate.clone().startOf('day'), endDate.clone().endOf('day')];
  }, [firstSelectedDate, secondSelectedDate]);

  const handlePointerDown = (date: Moment) => {
    setFirstSelectedDate(date);
    setSecondSelectedDate(date);
  };

  const handlePointerEnter = (date: Moment) => {
    if (firstSelectedDate !== null && secondSelectedDate !== null) {
      setSecondSelectedDate(date);
    }
  };

  const openCreateSectionModal = (startDate: Moment, endDate: Moment) => {
    setFirstSelectedDate(null);
    setSecondSelectedDate(null);
    openEditSectionModal({
      sessionId: session.id,
      initialStartDate: startDate,
      initialEndDate: endDate,
    })
  }

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
          const isInSelection = isInSession && selectedDates && moment(date).isBetween(selectedDates[0], selectedDates[1], "day", "[]");
          const isInWeekWithSessionDate = momentRangesOverlap([moment(session.startDate), moment(session.endDate)], [moment(date).startOf('week'), moment(date).endOf('week')])
          return {
            className: classNames(
              "rounded-none border border-solid border-neutral",
              {
                "bg-neutral-2 cursor-pointer": isInSession && !isInSelection,
                "bg-neutral-3 cursor-default text-transparent": !isInSession,
                "bg-aqua-1 cursor-pointer": isInSelection,
                "hidden": !isInWeekWithSessionDate,
                "text-black": moment(date).isSame(selectedMonth, "month") && isInSession,
              },
            ),
            onMouseDown: () => handlePointerDown(moment(date)),
            onPointerEnter: () => handlePointerEnter(moment(date)),
          };
        }}
        consistentWeeks={false}
        withHeader={false}
        highlightToday={false}
        firstDayOfWeek={0}
        withDragSlotSelect
        onDayClick={(date) => openCreateSectionModal(moment(date).startOf('day'), moment(date).startOf('day'))}
        onSlotDragEnd={(rangeStart, rangeEnd) => {console.log(rangeStart, rangeEnd); openCreateSectionModal(moment(rangeStart).startOf('day'), moment(rangeEnd).startOf('day'))}}
      />
    </div>
  );
}
