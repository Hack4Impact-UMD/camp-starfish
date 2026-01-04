"use client";
import { Button, Text, Title } from "@mantine/core";
import { SchedulingSectionID, SessionID } from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import React from "react";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import moment from "moment";
import useSession from "@/hooks/sessions/useSession";
import useSection from "@/hooks/sections/useSection";
import DownloadDaySchedulePDFButton from "@/features/scheduling/exporting/DownloadDaySchedulePDFButton";
import { isCommonSection } from "@/types/sectionTypeGuards";

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
  session: SessionID;
  section: SchedulingSectionID;
}

function SectionPageContent(props: SectionPageContentProps) {
  const { session, section } = props;

  const publishMutation = usePublishSectionSchedule();

  return (
    <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between p-md">
      <div>
        <Title order={1} className="text-2xl mb-2 font-bold">
          {session.name}
        </Title>
        <Text className="text-sm text-primary-5 mb-4 italic">
          {`Last generated: ${
            section && section.scheduleLastGenerated
              ? moment(section.scheduleLastGenerated).format(
                  "MM/DD/YYYY hh:mm:ss A"
                )
              : "N/A"
          }`}
        </Text>
      </div>
      <div className="flex gap-2">
        <Button
          color="green"
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
  );
}
