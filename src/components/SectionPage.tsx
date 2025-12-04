"use client";
import { Button } from "@mantine/core";
import { useAttendees } from "@/hooks/attendees/useAttendees";
import { useSectionPageData } from "@/hooks/sections/useSectionPageData";
import LoadingPage from "@/app/loading";
import React, { useState } from "react";
import ReactPDF from "@react-pdf/renderer";
import { CombinedPDF } from "@/features/scheduling/CombinedExportPDF";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import { ActivityGrid } from "./ActivityGrid";

interface SectionPageProps {
  sessionId: string;
  sectionId: string;
}

function SectionPage({ sessionId, sectionId }: SectionPageProps) {
  const { session, schedule:schedule, isError, isLoading, error } =
    useSectionPageData({ sessionId, sectionId });

  const { data: attendeeList } = useAttendees(sessionId);

  const campers = attendeeList?.filter((a) => a.role === "CAMPER");
  const staff = attendeeList?.filter((a) => a.role === "STAFF");
  const admins = attendeeList?.filter((a) => a.role === "ADMIN");

  const publishMutation = usePublishSectionSchedule();

  const freeplay = { posts: {}, buddies: {} };

  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = () => {
    setHasGenerated(!hasGenerated);

  };

  // ------------ LOADING / ERROR --------
  if (isLoading) return <LoadingPage />;
  if (isError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl mb-4 text-red-600">Error loading session</h1>
        <p>{error?.message ?? "Failed to load session data"}</p>
      </div>
    );
  }

  if (!session || !schedule || !attendeeList || !campers || !staff || !admins)
    return null;


  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 py-[50px] px-[50px]">
        {/* HEADER + BUTTONS */}
        <div className="flex flex-row justify-between">
          <div>
            <h1 className="text-2xl mb-2 font-bold">{session.name}</h1>
            <p className="text-sm text-gray-500 italic">Last Generated: N/A</p>
          </div>

          <div className="flex gap-2">
            <Button
              radius="xl"
              color="aqua"
              className="px-8 min-w-[130px]"
              onClick={handleGenerate}
            >
              GENERATE
            </Button>

            <Button
              radius="xl"
              className="px-8 min-w-[130px] bg-[#06A759] text-white"
              onClick={() => publishMutation.mutate({ sessionId, sectionId })}
            >
              PUBLISH
            </Button>

            <Button
              radius="xl"
              className="px-8 min-w-[130px] bg-[#1f3a48] text-white"
              onClick={async () => {
                try {
                  const pdfDoc = (
                    <CombinedPDF
                      schedule={schedule}
                      freeplay={freeplay}
                      campers={campers}
                      staff={staff}
                      admins={admins}
                      sectionName={session.name}
                    />
                  );
                  const blob = await ReactPDF.pdf(pdfDoc).toBlob();
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${session.name}-export.pdf`;
                  link.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("PDF generation failed:", err);
                }
              }}
            >
              EXPORT
            </Button>
          </div>
        </div>

        {/* ---------- BEFORE + AFTER VIEW ---------- */}

        {!hasGenerated && (
            <ActivityGrid sectionSchedule={schedule} isGenerated={false} />
        )}

        {hasGenerated && (
            <ActivityGrid
              sectionSchedule={schedule}
              isGenerated={true}
            />
        )}

      </div>
    </div>
  );
}

export default SectionPage;
