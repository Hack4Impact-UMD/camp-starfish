"use client";
import { useState } from "react";
import { Button, Text, Title } from "@mantine/core";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { Session, SchedulingSection } from "@/types/sessions/sessionTypes";
import LoadingPage from "@/app/loading";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import moment from "moment";
import useSession from "@/hooks/sessions/useSession";
import useSection from "@/hooks/sections/useSection";
import DownloadDaySchedulePDFButton from "@/features/scheduling/exporting/DownloadDaySchedulePDFButton";
import { isCommonSection } from "@/types/sessions/sessionTypeGuards";
import ActivityGrid from "@/components/ActivityGrid";
import useGenerateSectionSchedule from "@/features/scheduling/generation/hooks/useGenerateSectionSchedule.";
import useSaveSectionSchedule from "@/features/scheduling/generation/hooks/useSaveSectionSchedule";
import openConfirmationModal from "./modals/ConfirmationModal";
import useNotifications from "@/features/notifications/useNotifications";
import useUnsavedChangesWarning from "@/hooks/useUnsavedChangesWarning";

interface SectionPageProps {
  sessionId: string;
  sectionId: string;
}

export default function SectionPage(props: SectionPageProps) {
  const { sessionId, sectionId } = props;

  const sessionQuery = useSession(sessionId);
  const sectionQuery = useSection(sessionId, sectionId);

  // Only show loading/error when there's no data yet. A failed background refetch keeps the cached data,
  // and unmounting SectionPageContent then would throw away the user's unsaved edits.
  if (!sessionQuery.data || !sectionQuery.data) {
    if (sessionQuery.isError || sectionQuery.isError) {
      return <p>Error loading session data</p>;
    }
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

  const generateSectionScheduleMutation = useGenerateSectionSchedule();
  const saveSectionScheduleMutation = useSaveSectionSchedule();

  const publishMutation = usePublishSectionSchedule();
  const notifications = useNotifications();

  // Unsaved manual edits to the schedule (from drag & drop). null = showing the saved schedule.
  const [draftSchedule, setDraftSchedule] = useState<SectionSchedule | null>(null);
  const hasUnsavedChanges = draftSchedule !== null;

  useUnsavedChangesWarning(hasUnsavedChanges);

  const saveSchedule = (schedule: SectionSchedule, successMessage: string) => {
    // Show the schedule being saved right away, so edits made during the save build on it
    setDraftSchedule(schedule);
    saveSectionScheduleMutation.mutate(
      { sectionSchedule: schedule },
      {
        onSuccess: (_data, { sectionSchedule }) => {
          // Only clear the draft if no edits were made while saving; otherwise keep the newer edits unsaved
          setDraftSchedule((current) => (current === sectionSchedule ? null : current));
          notifications.success(successMessage);
        },
        onError: () =>
          notifications.error("Failed to save the schedule. Your changes are still here; please try again."),
      },
    );
  };

  // Generated schedules are saved immediately; admins can then adjust them with drag & drop
  const generateSchedule = () =>
    generateSectionScheduleMutation.mutate(
      {
        sessionId: session.id,
        sectionId: section.id,
      },
      {
        onSuccess: (data) =>
          saveSchedule(
            { ...data, sessionId: session.id, sectionId: section.id },
            "Schedule generated and saved.",
          ),
        onError: () => notifications.error("Failed to generate the schedule. Please try again."),
      },
    );

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
                ? moment(section.publishedAt).format("MM/DD/YYYY hh:mm:ss A")
                : "N/A"
            }`}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {saveSectionScheduleMutation.isPending ? (
            <Text className="text-sm italic">Saving...</Text>
          ) : (
            hasUnsavedChanges && (
              <Text className="text-sm italic text-warning">Unsaved changes</Text>
            )
          )}
          <Button
            color="green"
            onClick={() =>
              openConfirmationModal({
                title: "Generate a new schedule?",
                message:
                  "This will replace and save over the current schedule, including any unsaved edits.",
                onConfirm: generateSchedule,
                loading: generateSectionScheduleMutation.isPending,
              })
            }
            loading={generateSectionScheduleMutation.isPending}
            disabled={saveSectionScheduleMutation.isPending}
          >
            GENERATE
          </Button>
          <Button
            color="green"
            onClick={() => draftSchedule && saveSchedule(draftSchedule, "Schedule saved.")}
            loading={saveSectionScheduleMutation.isPending}
            disabled={!hasUnsavedChanges}
          >
            SAVE
          </Button>
          <Button
            color="neutral"
            variant="outline"
            onClick={() => setDraftSchedule(null)}
            disabled={!hasUnsavedChanges || saveSectionScheduleMutation.isPending}
          >
            DISCARD
          </Button>
          <Button
            color="green"
            disabled={hasUnsavedChanges}
            onClick={() => {
              publishMutation.mutate({
                sessionId: session.id,
                sectionId: section.id,
              });
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
      <ActivityGrid
        sessionId={session.id}
        sectionId={section.id}
        draftSchedule={draftSchedule}
        onScheduleChange={setDraftSchedule}
      />
    </div>
  );
}
