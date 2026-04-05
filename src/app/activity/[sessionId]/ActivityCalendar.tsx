"use client";

import React from "react";
import { SimpleGrid, Text, Box, Button } from "@mantine/core";
import { IconCheck, IconPencil, IconPlus } from "@tabler/icons-react";
import { Section, SectionType } from "@/types/sessions/sessionTypes";
import moment, { weekdaysShort } from "moment";
import classNames from "classnames";
import { openEditActivitiesModal } from "@/components/EditActivitiesModal";

interface ActivityCalendarProps {
  startDate: string;
  endDate: string;
  sections: Section[];
}

const sectionColorMap: Record<SectionType, string> = {
  "COMMON": "bg-red-100 text-red-800",
  "BUNDLE": "bg-blue-100 text-blue-800",
  "BUNK-JAMBO": "bg-green-100 text-green-800",
  "NON-BUNK-JAMBO": "bg-orange-100 text-orange-800",
};

function getSectionsForDay(sections: Section[], day: moment.Moment): Section[] {
  return sections.filter((section) =>
    day.isBetween(section.startDate, section.endDate, "day", "[]")
  );
}

function getSectionStartingOnDay(sections: Section[], day: moment.Moment): Section[] {
  return sections.filter((section) =>
    day.isSame(section.startDate, "day")
  );
}

function getSectionSpanInWeek(section: Section, weekStart: moment.Moment): { startCol: number; spanCols: number } {
  const sectionStart = moment(section.startDate);
  const sectionEnd = moment(section.endDate);
  const weekEnd = weekStart.clone().add(6, "days");

  const displayStart = moment.max(sectionStart, weekStart);
  const displayEnd = moment.min(sectionEnd, weekEnd);

  const startCol = displayStart.diff(weekStart, "days");
  const spanCols = displayEnd.diff(displayStart, "days") + 1;

  return { startCol, spanCols };
}

function isPublished(section: Section): boolean {
  return section.type !== "COMMON" && "publishedAt" in section && !!section.publishedAt;
}

export default function ActivityCalendar({ startDate, endDate, sections }: ActivityCalendarProps) {
  const sessionStart = moment(startDate);
  const sessionEnd = moment(endDate);

  const weekStarts: moment.Moment[] = [sessionStart.clone().startOf("week")];
  const lastWeekStart = sessionEnd.clone().startOf("week");
  while (weekStarts[weekStarts.length - 1].isBefore(lastWeekStart)) {
    weekStarts.push(weekStarts[weekStarts.length - 1].clone().add(1, "week"));
  }

  return (
    <div>
      {/* Weekday headers */}
      <SimpleGrid className="grid-cols-7 gap-0">
        {weekdaysShort().map((day) => (
          <Box
            key={day}
            className="p-2 bg-neutral-0 border border-solid border-neutral-5"
          >
            <Text className="text-xs text-center uppercase" fw={700}>{day}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Calendar weeks */}
      {weekStarts.map((weekStart, weekIdx) => {
        const weekDays = Array.from({ length: 7 }, (_, i) =>
          weekStart.clone().add(i, "day")
        );

        // Find sections that start in this week (for rendering section bars)
        const sectionsInWeek = sections.filter((section) => {
          const sStart = moment(section.startDate);
          const sEnd = moment(section.endDate);
          const wEnd = weekStart.clone().add(6, "days");
          return sStart.isSameOrBefore(wEnd, "day") && sEnd.isSameOrAfter(weekStart, "day");
        });

        return (
          <div key={weekIdx}>
            {/* Date row */}
            <SimpleGrid className="grid-cols-7 gap-0">
              {weekDays.map((day) => {
                const isInSession = day.isBetween(sessionStart, sessionEnd, "day", "[]");
                const daySections = getSectionsForDay(sections, day);
                const hasPublished = daySections.some(isPublished);

                return (
                  <Box
                    key={day.format("YYYY-MM-DD")}
                    className={classNames(
                      "p-2 border border-solid border-neutral-5 min-h-[150px]",
                      {
                        "bg-neutral-2": isInSession,
                        "bg-neutral-3": !isInSession,
                      }
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Text className="text-sm font-bold text-center">
                        {day.date()}
                      </Text>
                      {hasPublished && (
                        <IconCheck size={14} className="text-green-600" />
                      )}
                    </div>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Section bars overlaid on the week */}
            {sectionsInWeek.length > 0 && (
              <SimpleGrid className="grid-cols-7 gap-0 -mt-[120px] px-1 pointer-events-none">
                {(() => {
                  // Render section pills positioned in the grid
                  const cells: React.ReactNode[] = [];
                  let col = 0;

                  // Sort sections by start date
                  const sorted = [...sectionsInWeek].sort(
                    (a, b) => moment(a.startDate).diff(moment(b.startDate))
                  );

                  for (const section of sorted) {
                    const { startCol, spanCols } = getSectionSpanInWeek(section, weekStart);

                    // Add empty spacer cells before this section
                    if (startCol > col) {
                      for (let i = col; i < startCol; i++) {
                        cells.push(<Box key={`spacer-${weekIdx}-${i}`} />);
                      }
                    }

                    // Add section cell spanning multiple columns
                    cells.push(
                      <Box
                        key={section.id}
                        className={classNames(
                          "rounded-full px-3 py-1.5 mx-1 text-center text-xs font-semibold pointer-events-auto",
                          sectionColorMap[section.type]
                        )}
                        style={{ gridColumn: `span ${spanCols}` }}
                      >
                        {section.name}
                      </Box>
                    );

                    col = startCol + spanCols;
                  }

                  return cells;
                })()}
              </SimpleGrid>
            )}

            {/* Edit/Add Activity buttons row */}
            <SimpleGrid className="grid-cols-7 gap-0">
              {weekDays.map((day) => {
                const isInSession = day.isBetween(sessionStart, sessionEnd, "day", "[]");
                const startingSections = getSectionStartingOnDay(sections, day);
                const hasSections = getSectionsForDay(sections, day).length > 0;

                if (!isInSession) {
                  return <Box key={`btn-${day.format("YYYY-MM-DD")}`} />;
                }

                if (startingSections.length > 0) {
                  return (
                    <Box key={`btn-${day.format("YYYY-MM-DD")}`} className="p-1">
                      <Button
                        variant="outline"
                        size="xs"
                        fullWidth
                        color="gray"
                        rightSection={<IconPencil size={12} />}
                        onClick={() => openEditActivitiesModal({
                          section: startingSections[0],
                          sections,
                        })}
                      >
                        Edit Activity
                      </Button>
                    </Box>
                  );
                }

                if (!hasSections) {
                  return (
                    <Box key={`btn-${day.format("YYYY-MM-DD")}`} className="p-1">
                      <Button
                        variant="outline"
                        size="xs"
                        fullWidth
                        color="gray"
                        rightSection={<IconPlus size={12} />}
                      >
                        Add Activity
                      </Button>
                    </Box>
                  );
                }

                return <Box key={`btn-${day.format("YYYY-MM-DD")}`} />;
              })}
            </SimpleGrid>
          </div>
        );
      })}
    </div>
  );
}
