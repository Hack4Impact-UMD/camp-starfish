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

  const generateSectionScheduleMutation = useGenerateSectionSchedule();
  const saveSectionScheduleMutation = useSaveSectionSchedule();

  const publishMutation = usePublishSectionSchedule();
  const notifications = useNotifications();

  // Unsaved edits to the schedule (from generating or drag & drop). null = showing the saved schedule.
  const [draftSchedule, setDraftSchedule] = useState<SectionSchedule | null>(null);
  const hasUnsavedChanges = draftSchedule !== null;

  useUnsavedChangesWarning(hasUnsavedChanges);

  const generateSchedule = () =>
    generateSectionScheduleMutation.mutate(
      {
        sessionId: session.id,
        sectionId: section.id,
      },
      {
        onSuccess: (data) =>
          setDraftSchedule({
            ...data,
            sessionId: session.id,
            sectionId: section.id,
          }),
      },
    );

  const saveSchedule = () => {
    if (!draftSchedule) return;
    saveSectionScheduleMutation.mutate(
      { sectionSchedule: draftSchedule },
      {
        onSuccess: (_data, { sectionSchedule }) => {
          // Only clear the draft if no edits were made while saving; otherwise keep the newer edits unsaved
          setDraftSchedule((current) => (current === sectionSchedule ? null : current));
          notifications.success("Schedule saved.");
        },
        onError: () =>
          notifications.error("Failed to save the schedule. Your changes are still here; please try again."),
      },
    );
  };

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
          {hasUnsavedChanges && (
            <Text className="text-sm italic text-warning">Unsaved changes</Text>
          )}
          <Button
            color="green"
            onClick={() =>
              openConfirmationModal({
                title: "Generate a new schedule?",
                message:
                  "This will replace the schedule shown below, including any unsaved edits. Nothing is saved until you click SAVE.",
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
            onClick={saveSchedule}
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
