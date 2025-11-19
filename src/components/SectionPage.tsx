"use client";

import { Button } from "@mantine/core";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/data/firestore/sessions";
import { pdf } from "@react-pdf/renderer";
import {
  AdminAttendeeID,
  CamperAttendeeID,
  Freeplay,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
  SessionID,
  SectionSchedule,
  BundleActivity,
  ProgramAreaID,
  AgeGroup
} from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import React, { useEffect, useState } from "react";
import { CombinedPDF } from "@/app/pdf/CombinedExportPDF";

interface BuildInfo {
  timestamp: string;
  version: string;
  formattedDate: string;
}

interface SectionPageProps {
  sessionId?: string;
  fetchSession?: (sessionId: string) => Promise<SessionID>;
}

function SectionPage({
  sessionId: propSessionId,
  fetchSession = getSessionById,
}: SectionPageProps) {
  const params = useParams();
  const sessionId = propSessionId || (params?.sessionId as string);
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

  //combines components into PDF page
  const handleExportPDF = async (
    schedule: SectionScheduleID<SchedulingSectionType>,
    freeplay: Freeplay,
    campers: CamperAttendeeID[],
    staff: StaffAttendeeID[],
    admins: AdminAttendeeID[]
  ) => {
    try {
      const blob = await pdf(
        <CombinedPDF
          schedule={schedule}
          freeplay={freeplay}
          campers={campers}
          staff={staff}
          admins={admins}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "camp-schedule.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    const timestamp =
      process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || process.env.BUILD_TIMESTAMP;
    const version =
      process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION;

    if (timestamp) {
      const date = new Date(timestamp);
      setBuildInfo({
        timestamp,
        version: version || "unknown",
        formattedDate: date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  }, []);

  //FETCH SESSION DATA

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery<SessionID>({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId as string),
    enabled: !!sessionId,
    retry: 2,
  });

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
              className="px-8 min-w-[130px]"
              style={{ backgroundColor: "#06A759", color: "#ffffff" }}
              onClick={() => {
                console.log("add functionality here");
              }}
            >
              PUBLISH
            </Button>
            <Button
              variant="default"
              radius="xl"
              className="px-8 min-w-[130px]"
              style={{ backgroundColor: "#1f3a48", color: "#ffffff" }}
              onClick={() => {
                console.log("add functionality here");
                {
                  /*  handleExportPDF();*/
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
