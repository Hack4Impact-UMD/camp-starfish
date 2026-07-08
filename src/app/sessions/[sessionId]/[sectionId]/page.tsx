"use client";

import SectionPage from "@/components/SectionPage";
import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";

interface SectionRouteParams extends Params {
  sessionId: string;
  sectionId: string;
}

export default function SectionRoute() {
  const { token } = useAuth();

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            token?.claims.role === "ADMIN" || token?.claims.role === "STAFF",
          component: <SectionRouteContent />,
        },
      ]}
    />
  );
}

function SectionRouteContent() {
  const { sessionId, sectionId } = useParams<SectionRouteParams>();
  return <SectionPage sessionId={sessionId} sectionId={sectionId} />;
}