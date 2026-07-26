"use client";

import useSession from "@/hooks/sessions/useSession";
import LoadingPage from "@/app/loading";
import SessionPage from "./SessionPage";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";

interface SessionRouteParams extends Params {
  sessionId: string;
}

export default function SessionRoute() {
  const { token } = useAuth();

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            token?.claims.role === "ADMIN" || token?.claims.role === "STAFF",
          component: <SessionRouteContent />,
        },
      ]}
    />
  );
}

function SessionRouteContent() {
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
