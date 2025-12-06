"use client"
import SessionCalendar from "@/components/SessionCalendar";
import { SmallDirectoryBlock } from "@/components/SmallDirectoryBlock";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";
import useSession from "@/hooks/sessions/useSession";


interface SessionRouteParams extends Params {
  sessionId: string;
}
export default function Page() {
  const { sessionId } = useParams<SessionRouteParams>();
  const { data: session } = useSession(sessionId);

  if (!session) return null;

  return (
    <div className="flex flex-row gap-4">
      <SessionCalendar session = {session}/>
      <SmallDirectoryBlock sessionId={sessionId} />
    </div>
  );
}