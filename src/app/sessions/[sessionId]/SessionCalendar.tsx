import { Moment } from "moment";
import { useMemo, useState } from "react";
import { ActionIcon, Text, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  Section,
  SchedulingSection,
  SectionType,
  Session,
} from "@/types/sessions/sessionTypes";
import moment from "moment";
import classNames from "classnames";
import openEditSectionModal from "@/components/EditSectionModal";
import { MonthView, ScheduleHeader, ScheduleSingleEventData } from "@mantine/schedule";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { momentRangesOverlap } from "@/utils/timeUtils";
import useSectionList from "@/hooks/sections/useSectionList";
import LoadingPage from "@/app/loading";
import { useRouter } from "next/navigation";
import useSession from "@/hooks/sessions/useSession";
import ErrorPage from "@/app/error";
import { isSchedulingSection } from "@/types/sessions/sessionTypeGuards";
import { getSectionSchedule } from "@/data/firestore/sectionSchedules";
import { openEditActivitiesModal } from "@/components/EditActivitiesModal";
import { SectionsSubcollection } from "@/data/firestore/types/collections";

interface SessionCalendarProps {
  sessionId: string;
}

export default function SessionCalendar(props: SessionCalendarProps) {
  const { sessionId } = props;
  const sessionQuery = useSession(sessionId);
  const sectionsQuery = useSectionList(sessionId, { orderBy: [{ fieldPath: "startDate", direction: "asc" }] });

  if (sessionQuery.isPending || sectionsQuery.isPending) {
    return <LoadingPage />;
  } else if (sessionQuery.isError) {
    return <ErrorPage error={sessionQuery.error} />;
  } else if (sectionsQuery.isError) {
    return <ErrorPage error={sectionsQuery.error} />;
  } else {
    return <SessionCalendarContent session={sessionQuery.data} sections={sectionsQuery.data} />;
  }
}

const sectionTypeToEventColor: Record<SectionType, ScheduleSingleEventData['color']> = {
  "COMMON": "blue",
  "BUNDLE": "orange",
  "BUNK-JAMBO": "green",
  "NON-BUNK-JAMBO": "aqua"
}

const sectionTypeLabel: Record<SectionType, string> = {
  "COMMON": "Common",
  "BUNDLE": "Bundle",
  "BUNK-JAMBO": "Bunk Jamboree",
  "NON-BUNK-JAMBO": "Non-Bunk Jamboree"
}

interface SessionCalendarContentProps {
  session: Session;
  sections: Section[];
}

function SessionCalendarContent(props: SessionCalendarContentProps) {
  const { session, sections } = props;

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

  const router = useRouter();

  const events: ScheduleSingleEventData[] = sections.map(section => ({
    id: section.id,
    title: section.name,
    start: section.startDate.toDate(),
    end: section.endDate.toDate(),
    payload: section,
    color: sectionTypeToEventColor[section.type],
    variant: 'filled',
  }));

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
    const selectedSection = sections.find(
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
        date.clone().endOf("day"),
      );
      return;
    }

    try {
      const schedule = await getSectionSchedule(session.id, selectedSection.id);
      openEditActivitiesModal({
        section: selectedSection,
        sections,
        sessionId: session.id,
        initialSchedule: schedule ?? undefined,
      });
    } catch {
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
        events={events}
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
            moment(rangeEnd).endOf("day"),
          )
        }
        onEventClick={(event) => {
          if ((event.payload as Section).type !== "COMMON") {
            router.push(`/sessions/${session.id}/${event.id}`)
          }
        }}
        moreEventsProps={{
          classNames: {
            moreEventsDropdown: "rounded-sm"
          }
        }}
      />
      {/* Color key for section types */}
      <div className="flex flex-wrap items-center gap-4 mt-3">
        {(Object.keys(sectionTypeToEventColor) as SectionType[]).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{
                backgroundColor: `var(--mantine-color-${sectionTypeToEventColor[type]}-filled)`,
              }}
            />
            <Text className="text-xs text-neutral-6">
              {sectionTypeLabel[type]}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
