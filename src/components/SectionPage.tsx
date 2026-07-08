"use client";
import { Button, Text, Title, Tooltip } from "@mantine/core";
import { Session, SchedulingSection } from "@/types/sessions/sessionTypes";
import LoadingPage from "@/app/loading";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import moment from "moment";
import useSession from "@/hooks/sessions/useSession";
import useSection from "@/hooks/sections/useSection";
import DownloadDaySchedulePDFButton from "@/features/scheduling/exporting/DownloadDaySchedulePDFButton";
import { isCommonSection } from "@/types/sessions/sessionTypeGuards";
import ActivityGrid from "@/components/ActivityGrid";
import useNotifications from "@/features/notifications/useNotifications";
// Prototype (plan 013 spike): wires generateBundleSchedule into the UI for
// BUNDLE sections only. See plans/013-design-schedule-generation-ui.md.
import generateBundleSchedule from "@/features/scheduling/generation/generateBundleSchedule";
import useListAttendees from "@/hooks/attendees/useListAttendees";
import useActivityPreferences from "@/hooks/activityPreferences/useActivityPreferences";
import useDaysOffSchedule from "@/hooks/daysOffSchedules/useDaysOffSchedule";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import useSectionList from "@/hooks/sections/useSectionList";
import { setSectionScheduleDoc } from "@/data/firestore/sectionSchedules";

interface SectionPageProps {
  sessionId: string;
  sectionId: string;
}

export default function SectionPage(props: SectionPageProps) {
  const { sessionId, sectionId } = props;

  const sessionQuery = useSession(sessionId);
  const sectionQuery = useSection(sessionId, sectionId);

  if (sessionQuery.isError || sectionQuery.isError) {
    return <p>Error loading session data</p>;
  } else if (sessionQuery.isPending || sectionQuery.isPending) {
    return <LoadingPage />;
  }

  if (isCommonSection(sectionQuery.data)) return <p>Common Section provided</p>;

  return (
    <SectionPageContent
      session={sessionQuery.data}
      section={sectionQuery.data}
    />
  );
}

interface SectionPageContentProps {
  session: Session;
  section: SchedulingSection;
}

function SectionPageContent(props: SectionPageContentProps) {
  const { session, section } = props;

  const publishMutation = usePublishSectionSchedule();
  const notifications = useNotifications();

  return (
    <div className="flex flex-col gap-md p-md">
      <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
        <div>
          <Title order={1} className="text-2xl mb-2 font-bold">
            {session.name}
          </Title>
          <Text className="text-sm text-primary-5 mb-4 italic">
            {`Last generated: ${
              section && section.publishedAt
                ? moment(section.publishedAt).format(
                    "MM/DD/YYYY hh:mm:ss A",
                  )
                : "N/A"
            }`}
          </Text>
        </div>
        <div className="flex gap-2">
          {section.type === "BUNDLE" && (
            <GenerateBundleScheduleButton session={session} section={section} />
          )}
          <Button
            color="green"
            loading={publishMutation.isPending}
            disabled={publishMutation.isPending}
            onClick={() => {
              publishMutation.mutate(
                {
                  sessionId: session.id,
                  sectionId: section.id,
                },
                {
                  onSuccess: () => notifications.success("Schedule published."),
                  onError: () =>
                    notifications.error("Failed to publish schedule. Please try again."),
                },
              );
            }}
          >
            PUBLISH
          </Button>
          <DownloadDaySchedulePDFButton
            sectionId={section.id}
            sessionId={session.id}
            date={section.startDate}
          />
        </div>
      </div>
      <ActivityGrid sessionId={session.id} section={section} />
    </div>
  );
}

// Prototype (plan 013 spike). BUNDLE-only. Kept as an isolated component so its
// data hooks mount only for BUNDLE sections. See
// plans/013-design-schedule-generation-ui.md for the design and known blockers
// (programAreaId id-vs-name mismatch; unguarded generator lookups).
function GenerateBundleScheduleButton(props: {
  session: Session;
  section: SchedulingSection;
}) {
  const { session, section } = props;
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const attendeesQuery = useListAttendees(session.id);
  const prefsQuery = useActivityPreferences({
    sessionId: session.id,
    sectionId: section.id,
  });
  const daysOffQuery = useDaysOffSchedule(session.id);
  const scheduleQuery = useSectionSchedule(session.id, section.id);
  const sectionsQuery = useSectionList(session.id);

  const missingInputs =
    !attendeesQuery.data ||
    attendeesQuery.data.length === 0 ||
    !prefsQuery.data ||
    !daysOffQuery.data ||
    !scheduleQuery.data ||
    scheduleQuery.data.type !== "BUNDLE";

  const handleGenerate = async () => {
    const attendees = attendeesQuery.data;
    const camperActivityPreferences = prefsQuery.data;
    const daysOffSchedule = daysOffQuery.data;
    const currentSchedule = scheduleQuery.data;
    if (
      !attendees ||
      attendees.length === 0 ||
      !camperActivityPreferences ||
      !daysOffSchedule ||
      !currentSchedule ||
      currentSchedule.type !== "BUNDLE"
    ) {
      notifications.error(
        "Before generating, this section needs: attendees imported, a days-off schedule, activity preferences, and an existing BUNDLE activity layout.",
      );
      return;
    }

    const bundleSections = (sectionsQuery.data ?? []).filter(
      (s) => s.type === "BUNDLE",
    );
    const isFirstBundleOfSession =
      bundleSections.length > 0 &&
      [...bundleSections].sort((a, b) => a.startDate.diff(b.startDate))[0].id ===
        section.id;

    setGenerating(true);
    try {
      const generated = generateBundleSchedule({
        attendees,
        camperActivityPreferences,
        currentSchedule,
        daysOffSchedule,
        section,
        isFirstBundleOfSession,
      });
      await setSectionScheduleDoc(session.id, section.id, {
        type: generated.type,
        blocks: generated.blocks,
        alternatePeriodsOff: generated.alternatePeriodsOff,
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions", session.id, "sections", section.id, "schedule"],
      });
      notifications.success("Schedule generated.");
    } catch {
      notifications.error(
        "Schedule generation failed — see findings in plans/013-design-schedule-generation-ui.md.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Tooltip
      label={
        missingInputs
          ? "Needs attendees, a days-off schedule, activity preferences, and a BUNDLE activity layout"
          : "Generate this section's schedule"
      }
    >
      <Button
        variant="outline"
        color="blue"
        loading={generating}
        disabled={generating || missingInputs}
        onClick={handleGenerate}
      >
        GENERATE
      </Button>
    </Tooltip>
  );
}
