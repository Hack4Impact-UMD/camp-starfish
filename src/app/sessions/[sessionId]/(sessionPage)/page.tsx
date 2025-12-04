"use client";
import SessionCalendar from "@/components/SessionCalendar";
import { SmallDirectoryBlock } from "@/components/SmallDirectoryBlock";
import useSession from "@/hooks/sessions/useSession";
import { useParams } from "next/navigation";

export type SessionRouteParams = { sessionId: string };
export default function Page() {
const { sessionId } = useParams<SessionRouteParams>();
  const { data: session } = useSession(sessionId);
  if (!session) return null;
  return (
    <div className="flex flex-row gap-4">
      <SessionCalendar session={session} />
      <SmallDirectoryBlock sessionId={session.id} />
    </div>
  );
}
