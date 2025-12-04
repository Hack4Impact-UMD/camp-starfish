"use client";
import SessionCalendar from "@/components/SessionCalendar";
import { SmallDirectoryBlock } from "@/components/SmallDirectoryBlock";
import useSession from "@/hooks/sessions/useSession";
import { useParams } from "next/navigation";

export default function Page() {
  const { sessionId } = useParams();
  const { data: session } = useSession(sessionId);
  return (
    <div className="flex flex-row gap-4">
      <SessionCalendar session={session} />
      <SmallDirectoryBlock sessionId={session.id} />
    </div>
  );
}
