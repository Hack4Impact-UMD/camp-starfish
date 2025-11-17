"use client";

import { Button } from "@mantine/core";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/data/firestore/sessions";
import { SessionID } from "@/types/sessionTypes";
import LoadingPage from "@/app/loading";
import Navbar from "../components/Navbar";
import React, { useEffect, useState } from 'react';

interface BuildInfo {
  timestamp: string;
  version: string;
  formattedDate: string;
}

interface SectionPageProps {
  sessionId?: string;
}

function SectionPage({
  sessionId: propSessionId,
}: SectionPageProps) {
  const params = useParams();
  const sessionId = propSessionId || (params?.sessionId as string);
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

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

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery<SessionID>({
    queryKey: ["session", sessionId],
    queryFn: () => getSessionById(sessionId),
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
        <h1 className="text-2xl mb-2 bold">{session.name}</h1>
        <p className="text-sm text-gray-500 mb-4 italic">
          {buildInfo
            ? `Last generated: ${buildInfo.formattedDate}${
                buildInfo.version ? ` • v${buildInfo.version}` : ""
              }`
            : "Last generated information unavailable"}
        </p>
        <div className="mb-4 text-gray-600">
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Button
              variant="default"
              color="#06a759"
              radius="md"
              className="text-white"
              onClick={() => {
                console.log("add functionality here");
              }}
            >
              Publish
            </Button>
            <Button
              variant="default"
              color="#274a5c"
              radius="md"
              className="text-white"
              onClick={() => {
                console.log("add functionality here");
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionPage;
