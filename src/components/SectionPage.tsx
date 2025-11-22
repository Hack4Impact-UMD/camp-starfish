"use client";
import { Button } from "@mantine/core";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/data/firestore/sessions";
import { getSectionScheduleBySectionId, getSectionById, freeplayConverter, attendeeConverter } from "@/data/firestore/sections";
import {
  AdminAttendeeID,
  CamperAttendeeID,
  Freeplay,
  FreeplayID,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
  SessionID,
  AttendeeID,
  CamperAttendee,
  StaffAttendee,
  AdminAttendee,
} from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import React, { useEffect, useState } from "react";
import { CombinedPDF } from "@/app/pdf/CombinedExportPDF";
import { usePublishSectionSchedule } from "@/features/scheduling/publishing/publishSectionSchedule";
import ReactPDF from '@react-pdf/renderer';
import { db } from "@/config/firebase";
import { collection, CollectionReference } from "firebase/firestore";
import { Collection, SessionsSubcollection } from "@/data/firestore/utils";
import { executeQuery } from "@/data/firestore/firestoreClientOperations";

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
  const sectionId = (params?.sectionId as string) || undefined;
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

  // LAST MODIFIED INFORMATION
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
    isLoading: isLoadingSession,
    isError,
    error,
  } = useQuery<SessionID>({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId as string),
    enabled: !!sessionId,
    retry: 2,
  });

  // FETCH SECTION DATA
  const {
    data: section,
  } = useQuery({
    queryKey: ["section", sessionId, sectionId],
    queryFn: async () => {
      if (!sessionId || !sectionId) return null;
      return await getSectionById(sectionId, sessionId);
    },
    enabled: !!sessionId && !!sectionId,
  });

  // PUBLISH MUTATION
  const publishMutation = usePublishSectionSchedule();

  // FETCH SCHEDULE DATA
  const {
    data: schedule,
  } = useQuery<SectionScheduleID<SchedulingSectionType> | null>({
    queryKey: ["schedule", sessionId, sectionId],
    queryFn: async () => {
      if (!sessionId || !sectionId) return null;
      return await getSectionScheduleBySectionId(sectionId, sessionId);
    },
    enabled: !!sessionId && !!sectionId,
  });

  // FETCH FREEPLAY DATA
  const {
    data: freeplay,
  } = useQuery<FreeplayID | null>({
    queryKey: ["freeplay", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      try {
        const freeplaysRef = collection(
          db,
          Collection.SESSIONS,
          sessionId,
          SessionsSubcollection.FREEPLAYS
        ) as CollectionReference<FreeplayID, Freeplay>;
        const freeplays = await executeQuery<FreeplayID, Freeplay>(
          freeplaysRef,
          freeplayConverter
        );
        return freeplays.length > 0 ? freeplays[0] : null;
      } catch {
        return null;
      }
    },
    enabled: !!sessionId,
  });

  // FETCH ATTENDEES DATA
  const {
    data: attendees,
  } = useQuery<AttendeeID[]>({
    queryKey: ["attendees", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const attendeesRef = collection(
        db,
        Collection.SESSIONS,
        sessionId,
        SessionsSubcollection.ATTENDEES
      ) as CollectionReference<
        AttendeeID,
        CamperAttendee | StaffAttendee | AdminAttendee
      >;
      return await executeQuery<
        AttendeeID,
        CamperAttendee | StaffAttendee | AdminAttendee
      >(attendeesRef, attendeeConverter);
    },
    enabled: !!sessionId,
  });

  // separate attendees by role
  const campers = (attendees || []).filter(
    (a): a is CamperAttendeeID => a.role === "CAMPER"
  );
  const staff = (attendees || []).filter(
    (a): a is StaffAttendeeID => a.role === "STAFF"
  );
  const admins = (attendees || []).filter(
    (a): a is AdminAttendeeID => a.role === "ADMIN"
  );

//LOADING AND ERROR MESSAGES
const isLoading = isLoadingSession;

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
              className="px-8 min-w-[130px]"
              style={{ backgroundColor: "#1f3a48", color: "#ffffff" }}
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
                      sectionType={section?.type as SchedulingSectionType}
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
