"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import UserManagementPage from "./UserManagementPage";
import useUsers from "@/hooks/users/useUsers";

export default function UsersPage() {
  const { token } = useAuth();
  const usersQuery = useUsers();

  if (usersQuery.isPending) return <LoadingPage />;
  if (usersQuery.isError) return <ErrorPage error={new Error("Error loading users")} />;

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => token?.claims.role === "ADMIN",
          component: <UserManagementPage users={usersQuery.data} />,
        },
      ]}
    />
  );
}
