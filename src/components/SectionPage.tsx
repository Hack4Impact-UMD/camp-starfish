"use client";
import { Button } from "@mantine/core";
import {
  AttendeeID,
  Freeplay,
  FreeplayID,
  SchedulingSectionType,
  SectionID,
  SectionScheduleID,
  SessionID,
} from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import React, { useMemo } from "react";
import { CombinedPDF } from "@/features/scheduling/CombinedExportPDF";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import ReactPDF from "@react-pdf/renderer";
import moment from "moment";
import useSession from "@/hooks/sessions/useSession";
import useSection from "@/hooks/sections/useSection";
import useSectionSchedule from "@/hooks/schedules/useSectionSchedule";
import useFreeplay from "@/hooks/freeplays/useFreeplay";
import useAttendeesBySessionId from "@/hooks/attendees/useAttendeesBySessionId";

interface SectionPageProps {
  sessionId: string;
  sectionId: string;
}

export default function SectionPage(props: SectionPageProps) {
  const { sessionId, sectionId } = props;

  const { data: session, status: sessionStatus } = useSession(sessionId);
  const { data: section, status: sectionStatus } = useSection(
    sessionId,
    sectionId
  );
  const { data: schedule, status: scheduleStatus } = useSectionSchedule(
    sessionId,
    sectionId
  );
  const { data: freeplay, status: freeplayStatus } = useFreeplay(
    sessionId,
    section?.startDate
  );
  const { data: attendees, status: attendeesStatus } =
    useAttendeesBySessionId(sessionId);

  if (
    sessionStatus === "error" ||
    sectionStatus === "error" ||
    scheduleStatus === "error" ||
    freeplayStatus === "error" ||
    attendeesStatus === "error"
  ) {
    return <p>Error loading session data</p>;
  } else if (
    sessionStatus === "pending" ||
    sectionStatus === "pending" ||
    scheduleStatus === "pending" ||
    freeplayStatus === "pending" ||
    attendeesStatus === "pending"
  ) {
    return <LoadingPage />;
  }

  return (
    <SectionPageContent
      session={session}
      section={section}
      schedule={schedule}
      freeplay={freeplay}
      attendees={attendees}
    />
  );
}

interface SectionPageContentProps {
  session: SessionID;
  section: SectionID;
  schedule: SectionScheduleID<SchedulingSectionType>;
  freeplay: FreeplayID;
  attendees: AttendeeID[];
}

function SectionPageContent(props: SectionPageContentProps) {
  const { session, section, schedule, freeplay, attendees } = props;

  const { campers, staff, admins } = useMemo(
    () => ({
      campers: attendees.filter((a) => a.role === "CAMPER"),
      staff: attendees.filter((a) => a.role === "STAFF"),
      admins: attendees.filter((a) => a.role === "ADMIN"),
    }),
    [attendees]
  );

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
