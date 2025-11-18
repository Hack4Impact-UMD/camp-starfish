"use client";

import SessionsPage from "@/components/SessionsPage";
import StaffSessionsView from "@/components/StaffSessionsView";
import { useSessions } from "@/hooks/sessions/useSessions";
import LoadingPage from "../loading";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import ErrorPage from "@/app/error";

export default function Page() {
  const { data: sessions, isLoading, isError } = useSessions();
  const { token, user } = useAuth();
  
  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage error={new Error("Error loading sessions")} />;
  
    // prefer numeric/string campminderId custom claim if present, otherwise fall back to auth UID
    const attendeeId: string | undefined = token?.claims?.campminderId
      ? String(token.claims.campminderId)
      : user?.uid;
  
    return (
      <RequireAuth
        authCases={[
          {
            authFn: () => token?.claims.role === "ADMIN",
            component: <SessionsPage sessions={sessions || []} />,
          },
          {
            authFn: () => token?.claims.role === "STAFF",
            component: (
              <StaffSessionsView
                sessions={sessions || []}
                userUid={attendeeId}
              />
            ),
          },
          { authFn: () => true, component: <></> },
        ]}
      />
    );
}
