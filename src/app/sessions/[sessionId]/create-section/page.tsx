"use client";
import SessionCalendar from "@/components/SessionCalendar";
import { Params } from "next/dist/server/request/params";
import { useParams } from "next/navigation";
import useSession from "@/hooks/sessions/useSession";

interface SessionRouteParams extends Params {
  sessionId: string;
}

export default function Page() {
  const { sessionId } = useParams<SessionRouteParams>();
  const { data: session } = useSession(sessionId);

  if (!session) return null;
  return <SessionCalendar session={session}/>;
}