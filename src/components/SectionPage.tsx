"use client";
import { Button } from "@mantine/core";
import { useParams } from "next/navigation";
import { getSessionById } from "@/data/firestore/sessions";
import { Freeplay, SessionID } from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import React, { useMemo } from "react";
import { CombinedPDF } from "@/features/scheduling/CombinedExportPDF";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import ReactPDF from "@react-pdf/renderer";
import { useBuildInfo } from "@/hooks/sections/useBuildInfo";
import { useSectionPageData } from "@/hooks/sections/useSectionPageData";
import { useAttendees } from "@/hooks/attendees/useAttendees";
import useSession from "@/hooks/sessions/useSession";
import useSection from "@/hooks/sections/useSection";
import { useQuery } from "@tanstack/react-query";
import { getSectionScheduleBySectionId } from "@/data/firestore/sections";

interface SectionPageProps {
  sessionId: string;
  sectionId: string;
}

function SectionPage({
  sessionId, sectionId
}: SectionPageProps) {
  const buildInfo = useBuildInfo();
  const { data: session, isLoading, isError, error } = useSession(sessionId);
  const { data: section } = useSection(sessionId, sectionId);
  const { data: attendees } = useAttendees(sessionId);
  const { data: schedule } = useQuery({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'],
    queryFn: () => getSectionScheduleBySectionId(sectionId, sessionId),
    enabled: !!sessionId && !!sectionId
  });
  // get freeplay if necessary


  const { campers, staff, admins } = useMemo(() => {
    if (!attendees) return { campers: [], staff: [], admins: [] };
    return {
      campers: attendees.filter((attendee) => attendee.role === "CAMPER"),
      staff: attendees.filter((attendee) => attendee.role === "STAFF"),
      admins: attendees.filter((attendee) => attendee.role === "ADMIN"),
    };
  }, [attendees]);

  const publishMutation = usePublishSectionSchedule();

  if (isLoading) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div>
        <div className="p-4">
          <h1 className="text-2xl mb-4 text-red-600">Error loading session</h1>
          <p className="text-gray-600">
            {error instanceof Error
              ? error.message
              : "Failed to load session data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl mb-2 font-bold">{session.name}</h1>
            <p className="text-sm text-gray-500 mb-4 italic">
              {buildInfo
                ? `Last generated: ${buildInfo.formattedDate}${
                    buildInfo.version ? ` • v${buildInfo.version}` : ""
                  }`
                : "Last generated information unavailable"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              radius="xl"
              className="px-8 min-w-[130px] bg-[#06A759] text-white"
              onClick={() => {
                if (sessionId && sectionId) {
                  publishMutation.mutate({ sessionId, sectionId });
                }
              }}
            >
              PUBLISH
            </Button>
            <Button
              variant="default"
              radius="xl"
              className="px-8 min-w-[130px] bg-[#1f3a48] text-white"
              onClick={async () => {
                try {
                  if (!schedule || !freeplay) {
                    console.error("No schedule or freeplay data available.");
                    return;
                  }
                  const freeplayData: Freeplay = {
                    posts: freeplay.posts,
                    buddies: freeplay.buddies,
                  };
                  const pdfDoc = (
                    <CombinedPDF
                      schedule={schedule}
                      freeplay={freeplayData}
                      campers={campers}
                      staff={staff}
                      admins={admins}
                      sectionName={section?.name as string}
                    />
                  );
                  const blob = await ReactPDF.pdf(pdfDoc).toBlob();
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${session?.name || "schedule"}-export.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                } catch (error) {
                  console.error("Failed to generate PDF:", error);
                }
              }}
            >
              EXPORT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionPage;
