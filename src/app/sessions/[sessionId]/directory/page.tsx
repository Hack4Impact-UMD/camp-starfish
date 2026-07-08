"use client";

import DirectoryTableView from "./DirectoryTableView";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";

interface SessionRouteParams extends Params {
  sessionId: string;
}

export default function DirectoryPage() {
  const { token } = useAuth();

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            token?.claims.role === "ADMIN" || token?.claims.role === "STAFF",
          component: <DirectoryPageContent />,
        },
      ]}
    />
  );
}

function DirectoryPageContent() {
  const { sessionId } = useParams<SessionRouteParams>();
  return <DirectoryTableView sessionId={sessionId} />;
}
