"use client";

import SessionsPage from "@/components/SessionsPage";
import useSessionList from "@/hooks/sessions/useSessionList";
import LoadingPage from "../loading";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import ErrorPage from "@/app/error";

export default function Page() {
  const { token } = useAuth();

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            !!token?.claims.role && token.claims.role !== "PHOTOGRAPHER",
          component: <SessionsPage />,
        },
      ]}
      fallbackComponent={<p>You do not have permission to access this page.</p>}
    />
  );
}
