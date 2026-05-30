import { Moment } from "moment";
import { useMemo, useState } from "react";
import { ActionIcon, Text, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { SchedulingSection, Session } from "@/types/sessions/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import openEditSectionModal from "@/components/EditSectionModal";
import { MonthView, ScheduleHeader } from "@mantine/schedule";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { momentRangesOverlap } from "@/utils/timeUtils";
import useListSections from "@/hooks/sections/useListSections";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import { getSectionSchedule } from "@/data/firestore/sectionSchedules";
import { openEditActivitiesModal } from "@/components/EditActivitiesModal";
import { SectionsSubcollection } from "@/data/firestore/types/collections";

interface SessionCalendarProps {
  session: Session;
}

export default function SessionCalendar({ session }: SessionCalendarProps) {
  const sectionsQuery = useListSections(session.id);
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
    const startDate = firstSelectedDate.isBefore(secondSelectedDate)
      ? firstSelectedDate
      : secondSelectedDate;
    const endDate =
      startDate === firstSelectedDate ? secondSelectedDate : firstSelectedDate;
    return [startDate.clone().startOf("day"), endDate.clone().endOf("day")];
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
    });
  };

  // Single-day click: if the day falls within an existing scheduling section,
  // open that section's activities editor; otherwise start creating a section.
  const handleDayClick = async (date: Moment) => {
    // Wait for sections to load before deciding which flow to open, so we never
    // open "Create Section" on top of a section that simply hasn't loaded yet.
    if (sectionsQuery.isPending || !sectionsQuery.data) {
      modals.open({
        title: "Loading",
        children: <Text>Please wait while sections are loading...</Text>,
      });
      return;
    }

    const selectedSection = sectionsQuery.data.find(
      (section): section is SchedulingSection =>
        isSchedulingSection(section) &&
        typeof section.id === "string" &&
        section.id.trim() !== "" &&
        section.id !== SectionsSubcollection.SCHEDULE &&
        date.isBetween(section.startDate, section.endDate, "day", "[]"),
    );

    if (!selectedSection) {
      openCreateSectionModal(
        date.clone().startOf("day"),
        date.clone().startOf("day"),
      );
      return;
    }

    try {
      const schedule = await getSectionSchedule(session.id, selectedSection.id);
      openEditActivitiesModal({
        section: selectedSection,
        sections: sectionsQuery.data,
        sessionId: session.id,
        initialSchedule: schedule,
      });
    } catch (error) {
      console.error("Failed to load section schedule:", error);
      const isMissingSchedule =
        error instanceof Error && error.message.includes("Document not found");

      // No schedule doc yet: open the editor with a default (empty) layout.
      if (isMissingSchedule) {
        openEditActivitiesModal({
          section: selectedSection,
          sections: sectionsQuery.data,
          sessionId: session.id,
        });
        return;
      }

      modals.open({
        title: "Error",
        children: (
          <Text>Failed to load section activities. Please try again.</Text>
        ),
      });
    }
  };

  return (
    <div>
      <ScheduleHeader className="flex items-center">
        <Tooltip label="Previous month">
          <ActionIcon
            variant="outline"
            size="md"
            onClick={() =>
              setSelectedMonth((prev) => prev.clone().subtract(1, "month"))
            }
            disabled={selectedMonth.isSame(session.startDate, "month")}
            aria-label="Previous month"
          >
            <MdChevronLeft size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Next month">
          <ActionIcon
            variant="outline"
            size="md"
            onClick={() =>
              setSelectedMonth((prev) => prev.clone().add(1, "month"))
            }
            disabled={selectedMonth.isSame(session.endDate, "month")}
            aria-label="Next month"
          >
            <MdChevronRight size={20} />
          </ActionIcon>
        </Tooltip>
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
          const isInSelection =
            isInSession &&
            selectedDates &&
            moment(date).isBetween(
              selectedDates[0],
              selectedDates[1],
              "day",
              "[]",
            );
          const isInWeekWithSessionDate = momentRangesOverlap(
            [moment(session.startDate), moment(session.endDate)],
            [moment(date).startOf("week"), moment(date).endOf("week")],
          );
          return {
            className: classNames(
              "rounded-none border border-solid border-neutral",
              {
                "bg-neutral-2 cursor-pointer": isInSession && !isInSelection,
                "bg-neutral-3 cursor-default text-transparent pointer-events-none":
                  !isInSession,
                "bg-aqua-1 cursor-pointer": isInSelection,
                hidden: !isInWeekWithSessionDate,
                "text-black":
                  moment(date).isSame(selectedMonth, "month") && isInSession,
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
        onDayClick={(date) => {
          void handleDayClick(moment(date));
        }}
        onSlotDragEnd={(rangeStart, rangeEnd) =>
          openCreateSectionModal(
            moment(rangeStart).startOf("day"),
            moment(rangeEnd).startOf("day"),
          )
        }
      />
    </div>
  );
}
