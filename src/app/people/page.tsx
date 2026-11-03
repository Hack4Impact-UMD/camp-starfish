"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import PeoplePage from "./PeoplePage";

export default function PeopleRoute() {
  const { token } = useAuth();
  return (
    <RequireAuth
      authCases={[
        {
          authFn: () => token?.claims.role === "ADMIN",
          component: <PeoplePage />,
        },
      ]}
    />
  );
}
