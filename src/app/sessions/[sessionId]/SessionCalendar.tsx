import { Moment, weekdaysShort } from "moment";

import React, { useState } from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import { SchedulingSection, Session } from "@/types/sessions/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import { modals } from "@mantine/modals";
import { SectionsSubcollection } from "@/data/firestore/types/collections";
import EditSectionModal from "@/components/EditSectionModal";
import useSections from "@/hooks/sections/useSectionsBySessionId";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import { getSectionSchedule } from "@/data/firestore/sectionSchedules";
import { openEditActivitiesModal } from "@/components/EditActivitiesModal";

interface SessionCalendarProps {
  session: Session;
}

export default function SessionCalendar({ session }: SessionCalendarProps) {
  const sectionsQuery = useSections(session.id);
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

  const handlePointerUp = async () => {
    if (isSelecting) {
      const rangeStart = firstSelectedDate.isSameOrBefore(secondSelectedDate)
        ? firstSelectedDate
        : secondSelectedDate;
      const rangeEnd = firstSelectedDate.isSameOrBefore(secondSelectedDate)
        ? secondSelectedDate
        : firstSelectedDate;

      // Single-day click on an existing scheduling section opens activities modal.
      // Guard: only proceed if sections data is loaded
      if (
        rangeStart.isSame(rangeEnd, "day") &&
        sectionsQuery.data &&
        !sectionsQuery.isPending
      ) {
        const validSchedulingSections = sectionsQuery.data.filter(
          (section): section is SchedulingSection =>
            isSchedulingSection(section) &&
            typeof section.id === "string" &&
            section.id.trim() !== "",
        );

        const invalidSchedulingSections = sectionsQuery.data.filter(
          (section) =>
            isSchedulingSection(section) &&
            (!section.id || typeof section.id !== "string" || section.id.trim() === ""),
        );

        if (invalidSchedulingSections.length > 0) {
          console.warn("Skipping invalid scheduling sections:", invalidSchedulingSections);
        }

        const selectedSection = validSchedulingSections.find((section) =>
          rangeStart.isBetween(section.startDate, section.endDate, "day", "[]"),
        );

        if (selectedSection) {
          try {
            // Defensive check: ensure section id is a real section id, not empty or the literal "schedule"
            if (
              !selectedSection.id ||
              selectedSection.id.trim() === "" ||
              selectedSection.id === SectionsSubcollection.SCHEDULE
            ) {
              console.error("Invalid selectedSection id:", selectedSection);
              throw new Error(`Invalid section id: ${selectedSection.id}`);
            }
            const schedule = await getSectionSchedule(session.id, selectedSection.id);
            openEditActivitiesModal({
              section: selectedSection,
              sections: sectionsQuery.data,
              sessionId: session.id,
              initialSchedule: schedule,
            });
            setFirstSelectedDate(null);
            setSecondSelectedDate(null);
            return;
          } catch (error) {
            console.error("Failed to load section schedule:", error);
            const isMissingSchedule =
              error instanceof Error &&
              error.message.includes("Document not found");

            if (isMissingSchedule) {
              openEditActivitiesModal({
                section: selectedSection,
                sections: sectionsQuery.data,
                sessionId: session.id,
              });
              setFirstSelectedDate(null);
              setSecondSelectedDate(null);
              return;
            }

            modals.open({
              title: "Error",
              children: (
                <Text>Failed to load section activities. Please try again.</Text>
              ),
            });
            setFirstSelectedDate(null);
            setSecondSelectedDate(null);
            return;
          }
        }
      }

      // Only open create section modal if sections have finished loading
      if (sectionsQuery.isPending) {
        modals.open({
          title: "Loading",
          children: (
            <Text>Please wait while sections are loading...</Text>
          ),
        });
        setFirstSelectedDate(null);
        setSecondSelectedDate(null);
        return;
      }

      modals.open({
        title: "Create Section",
        children: (
          <EditSectionModal
            selectedStartDate={
              rangeStart
            }
            selectedEndDate={
              rangeEnd
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
    <SimpleGrid className="grid-cols-7 gap-0 select-none">
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
  );
}
