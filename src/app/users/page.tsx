"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import LoadingPage from "@/app/loading";
import ErrorPage from "@/app/error";
import UsersPage from "./UsersPage";
import useUserList from "@/hooks/users/useUserList";

export default function UsersRoute() {
  const { token } = useAuth();
  const usersQuery = useUserList();

  if (usersQuery.isPending) return <LoadingPage />;
  if (usersQuery.isError)
    return <ErrorPage error={new Error("Error loading users")} />;

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => token?.claims.role === "ADMIN",
          component: <UsersPage users={usersQuery.data} />,
        },
      ]}
    />
  );
}
