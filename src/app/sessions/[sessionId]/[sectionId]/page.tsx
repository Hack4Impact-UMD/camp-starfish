"use client";

import SectionPage from "@/components/SectionPage";
import { Params } from "next/dist/server/request/params";
import { useParams } from "next/navigation";

interface SectionRouteParams extends Params {
  sessionId: string;
  sectionId: string;
}

export default function SectionRoute() {
  const { sectionId, sessionId } = useParams<SectionRouteParams>();
  return <SectionPage sessionId={sessionId} sectionId={sectionId} />;
}
