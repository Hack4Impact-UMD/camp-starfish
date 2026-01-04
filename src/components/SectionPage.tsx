"use client";
import { Button } from "@mantine/core";
import {
  FreeplayID,
  SchedulingSectionID,
  SessionID,
} from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import React from "react";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import moment from "moment";
import useSession from "@/hooks/sessions/useSession";
import useSection from "@/hooks/sections/useSection";
import useFreeplay from "@/hooks/freeplays/useFreeplay";
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
    <div>
      <div className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl mb-2 font-bold">{session.name}</h1>
            <p className="text-sm text-gray-500 mb-4 italic">
              {`Last generated: ${
                section && section.scheduleLastGenerated
                  ? moment(section.scheduleLastGenerated).format(
                      "MM/DD/YYYY hh:mm:ss A"
                    )
                  : "N/A"
              }`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              radius="xl"
              className="px-8 min-w-[130px] bg-[#06A759] text-white"
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
      </div>
    </div>
  );
}
