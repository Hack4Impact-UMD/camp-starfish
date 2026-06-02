"use client";

import SessionsPage from "@/components/SessionsPage";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";

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
