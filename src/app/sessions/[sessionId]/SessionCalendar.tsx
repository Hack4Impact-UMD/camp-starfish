import React, { useState, useEffect, useRef } from "react";
import { SimpleGrid, Text, Box } from "@mantine/core";
import moment, { Moment, weekdaysShort } from "moment";
import classNames from "classnames";
import { modals } from "@mantine/modals";
import EditSectionModal from "@/components/EditSectionModal";
import useSections from "@/hooks/sections/useSectionsBySessionId";
import { SectionID, SessionID } from "@/types/sessionTypes";
import { text } from "stream/consumers";

interface SessionCalendarProps {
  session: SessionID;
}

type SectionIDModified = SectionID & { bundleNum: number };

export default function SessionCalendar({ session }: SessionCalendarProps) {
  const { data: sections } = useSections(session.id);

  const calendarRef = useRef<HTMLDivElement>(null);
  const [dayWidth, setDayWidth] = useState<number>(0);
  const[sectionsBundle, setSectionsBundles] = useState<SectionIDModified[]>([]);
  const pastelColors = ["#FDEBD0", "#D5F5E3", "#D6EAF8"];
  const textColors = ["#8E5F14", "#2C7A4D", "#28648C"];



  const getSectionColor = (section: SectionIDModified) => {
    // For specific known types
    if (section.type === "NON-BUNK-JAMBO" || section.type === "BUNK-JAMBO") return "#E8DAEF";
    if (section.type === "COMMON") return "#F8D6D8";


    // For other bundles, pick pastel color based on index
    return pastelColors[(section.bundleNum) % pastelColors.length];  
  };
  
  const getTextColor = (section: SectionIDModified) => {
    // For specific known types
    if (section.type === "NON-BUNK-JAMBO" || section.type === "BUNK-JAMBO") return "#6E3187";
    if (section.type === "COMMON") return "#90393E";

    return textColors[(section.bundleNum) % textColors.length];
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (calendarRef.current) {
        const containerWidth = calendarRef.current.offsetWidth;
        setDayWidth(containerWidth / 7);
      }
    });
    if (calendarRef.current) {
      resizeObserver.observe(calendarRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);
  useEffect(() => {
    if (!sections) return;
    let bundleCounter = 0;
    const sectionBundles = sections.map((section, idx) => {
      if (section.type === "BUNDLE") {
        const updated = { ...section, bundleNum: bundleCounter };
        bundleCounter += 1; // increment for next BUNDLE
        return updated;
      }

      return {
        ...section,
        bundleNum: -1, 
      };
    });

    setSectionsBundles(sectionBundles);
  }, [sections]);

  // Selection logic
  const [firstSelectedDate, setFirstSelectedDate] = useState<Moment | null>(null);
  const [secondSelectedDate, setSecondSelectedDate] = useState<Moment | null>(null);
  const isDayOccupied = (day: Moment) => {
    if (!sections) return false;
    return sections.some(
      (section) =>
        day.isBetween(moment(section.startDate), moment(section.endDate), "day", "[]")
    );
  };

  const isSelecting = firstSelectedDate !== null && secondSelectedDate !== null;

  const handlePointerDown = (date: Moment) => {
    if (isDayOccupied(date)) return; 
    setFirstSelectedDate(date);
    setSecondSelectedDate(date);
  };
  const handlePointerEnter = (date: Moment) => {
    if (isDayOccupied(date)) return; // Block selection

    if (isSelecting) setSecondSelectedDate(date);
  };

  const handlePointerUp = () => {

    if (isSelecting && firstSelectedDate && secondSelectedDate) {
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

  // Generate weeks
  const weekStarts = [moment(session.startDate).startOf("week")];
  const lastWeekStart = moment(session.endDate).clone().startOf("week");
  while (weekStarts[weekStarts.length - 1].isBefore(lastWeekStart)) {
    weekStarts.push(weekStarts[weekStarts.length - 1].clone().add(1, "week"));
  }

  return (
    <Box ref={calendarRef} className="w-full relative">
      {/* Weekday headers */}
      <SimpleGrid className="grid-cols-7 gap-0 select-none ">
        {weekdaysShort().map((day) => (
          <Box
            key={day}
            className="p-xs bg-neutral-0 border-[1px] border-collapse border-solid border-neutral-5"
            style={{ width: dayWidth }}
          >
            <Text fw={700} className="text-sm text-center font-black uppercase">
              {day}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {weekStarts.map((weekStart, weekIndex) => {
        const days = Array.from({ length: 7 }, (_, i) =>
          weekStart.clone().add(i, "day")
        );

        return (
          <Box key={weekIndex} className="relative flex border-b border-neutral-5">
            {/* Day boxes (stay neutral) */}
            {days.map((day) => {
              const isInSession = day.isBetween(session.startDate, session.endDate, "day", "[]");

              const eventHandlers = isInSession
                ? {
                    onPointerDown: () => handlePointerDown(day),
                    onPointerEnter: () => handlePointerEnter(day),
                    onPointerUp: () => handlePointerUp(),
                  }
                : {};

              return (
                <Box
                  key={day.format("YYYY-MM-DD")}
                  {...eventHandlers}
                  className={classNames(
                    "relative border-l border-r border-neutral-5 min-h-52 flex items-start justify-center",
                    { "bg-neutral-2": isInSession, "bg-neutral-3": !isInSession }
                  )}
                  style={{ width: dayWidth }}
                >
                  <Text
                    fw={700}
                    className="text-sm font-bold text-center mt-1 mb-1 select-none"
                  >
                    {day.date()}
                  </Text>
                </Box>
              );
            })}

            {/* Render selection pill instead of background highlight */}
            {isSelecting && firstSelectedDate && secondSelectedDate && (() => {
              const startIndex = days.findIndex(d =>
                d.isSame(firstSelectedDate.isBefore(secondSelectedDate) ? firstSelectedDate : secondSelectedDate, "day")
              );
              const endIndex = days.findIndex(d =>
                d.isSame(firstSelectedDate.isBefore(secondSelectedDate) ? secondSelectedDate : firstSelectedDate, "day")
              );

              if (startIndex === -1 && endIndex === -1) return null;

              const leftIndex = startIndex === -1 ? 0 : startIndex;
              const rightIndex = endIndex === -1 ? days.length - 1 : endIndex;

              return (
                <Box
                  className="absolute bg-neutral-5 rounded-lg flex items-center justify-center text-xs px-1 overflow-hidden"
                  style={{
                    left: leftIndex * dayWidth + 10,
                    width: (rightIndex - leftIndex + 1) * dayWidth - 20,
                    top: 28,
                  }}
                >
                  <Text className="truncate text-center text-white select-none">
                    N/A
                  </Text>
                </Box>
              );
            })()}

            {/* Render existing sections */}
            {sectionsBundle?.map((section) => {
              const startIndex = days.findIndex(d =>
                d.isSame(moment(section.startDate), "day")
              );
              const endIndex = days.findIndex(d =>
                d.isSame(moment(section.endDate), "day")
              );

              if (startIndex === -1 && endIndex === -1) return null;

              const leftIndex = startIndex === -1 ? 0 : startIndex;
              const rightIndex = endIndex === -1 ? days.length - 1 : endIndex;

              return (
                <Box
                  key={section.id}
                  className={classNames(
                    "absolute rounded-lg flex items-center justify-center text-xs px-1 overflow-hidden",
                  )}
                  style={{
                    left: leftIndex * dayWidth + 10,
                    width: (rightIndex - leftIndex + 1) * dayWidth - 20,
                    top: 28,
                    backgroundColor: getSectionColor(section),
                  }}
                >
                  <Text 
                    className="truncate text-center select-none overflow-hidden"
                    style={{ color: getTextColor(section) }}
                  >
                    {section.name}
                  </Text>
                </Box>
              );
            })}

          </Box>
        );
      })}


    </Box>
  );
}
