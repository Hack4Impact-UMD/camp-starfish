"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import UsersPage from "./UsersPage";

export default function UsersRoute() {
  const { token } = useAuth();
  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => token?.claims.role === "ADMIN",
          component: <UsersPage />,
        },
      ]}
    />
  );
}
