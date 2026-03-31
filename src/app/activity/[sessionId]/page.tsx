"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";
import ActivityPage from "./ActivityPage";

interface ActivityRouteParams extends Params {
  sessionId: string;
}

export default function Page() {
  const { sessionId } = useParams<ActivityRouteParams>();
  const { token } = useAuth();
  const allowedRoles: Role[] = ["ADMIN", "STAFF"];

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            allowedRoles.some((role: Role) => token?.claims.role === role),
          component: <ActivityPage sessionId={sessionId} />,
        },
      ]}
    />
  );
}
