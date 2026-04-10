"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import UserManagementPage from "./UserManagementPage";

export default function UsersPage() {
  const { token } = useAuth();

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => token?.claims.role === "ADMIN",
          component: <UserManagementPage />,
        },
      ]}
    />
  );
}