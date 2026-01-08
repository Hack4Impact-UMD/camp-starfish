"use client";

import SessionsPage from "@/components/SessionsPage";
import StaffSessionsView from "@/components/StaffSessionsView";
import { useSessions } from "@/hooks/sessions/useSessions";
import LoadingPage from "../loading";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import ErrorPage from "@/app/error";

export default function Page() {
  const sessionsQuery = useSessions();
  const { token } = useAuth();

  if (sessionsQuery.isPending) return <LoadingPage />;
  else if (sessionsQuery.isError)
    return <ErrorPage error={new Error("Error loading sessions")} />;

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            !!token?.claims.role && token.claims.role !== "PHOTOGRAPHER",
          component: <SessionsPage sessions={sessionsQuery.data} />,
        },
      ]}
      fallbackComponent={<p>You do not have permission to access this page.</p>}
    />
  );
}
