"use client";

import SessionsPage from "@/components/SessionsPage";
import StaffSessionsView from "@/components/StaffSessionsView";
import { useSessions } from "@/hooks/sessions/useSessions";
import LoadingPage from "../loading";
import RequireAuth from "@/auth/RequireAuth";
import { Role } from "@/types/personTypes";
import { useAuth } from "@/auth/useAuth";

export default function Page() {
  const { data: sessions, isLoading, isError } = useSessions();
  const { token, user } = useAuth();
  const allowedRoles: Role[] = ["ADMIN", "STAFF"];
  
  if (isLoading) return <LoadingPage />;
  if (isError) return <p>Error loading sessions.</p>;
  
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
