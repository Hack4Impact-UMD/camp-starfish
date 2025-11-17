"use client";

import SessionsPage from "@/components/SessionsPage";
import { useSessions } from "@/hooks/sessions/useSessions";
import LoadingPage from "../loading";
import RequireAuth from "@/auth/RequireAuth";
import { Role } from "@/types/personTypes";
import { useAuth } from "@/auth/useAuth";

export default function Page() {
  const { data: sessions, isLoading, isError } = useSessions();
  const { token } = useAuth();
  const allowedRoles: Role[] = ["ADMIN", "STAFF"];
  
  if (isLoading) return <LoadingPage />;
  if (isError) return <p>Error loading sessions.</p>;
  
  return <RequireAuth
    authCases={[
      {
        authFn: () => allowedRoles.some((role: Role) => token?.claims.role === role),
        component: <SessionsPage sessions={sessions || []} />,
      },
    ]}
  />;
}
