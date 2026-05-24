"use client";

import useSession from "@/hooks/sessions/useSession";
import LoadingPage from "@/app/loading";
import SessionPage from "./SessionPage";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";

interface SessionRouteParams extends Params {
  sessionId: string;
}

export default function SessionRoute() {
  const { sessionId } = useParams<SessionRouteParams>();
  const { data: session, status } = useSession(sessionId);

  switch (status) {
    case "pending":
      return <LoadingPage />;
    case "error":
      return <p>Error loading session data</p>;
    case "success":
      return <SessionPage session={session} />;
  }
}
