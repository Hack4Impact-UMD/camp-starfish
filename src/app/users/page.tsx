"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import UserManagementPage from "./UserManagementPage";
import useUsers from "@/hooks/users/useUsers";

export default function UsersPage() {
  const { token } = useAuth();
  const isAdmin = token?.claims.role === "ADMIN";
  // Only fetch users once we know the viewer is an admin, so non-admins get the
  // RequireAuth "no permission" message instead of a Firestore permission error.
  const usersQuery = useUsers(isAdmin);

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => isAdmin,
          component: usersQuery.isPending ? (
            <LoadingPage />
          ) : usersQuery.isError ? (
            <ErrorPage error={new Error("Error loading users")} />
          ) : (
            <UserManagementPage users={usersQuery.data ?? []} />
          ),
        },
      ]}
    />
  );
}
