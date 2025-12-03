"use client"
import SessionCalendar from "@/components/SessionCalendar";
import { SmallDirectoryBlock } from "@/components/SmallDirectoryBlock";
import { useSessionContext } from "./SessionContext";

export default function Page() {
  const session = useSessionContext();
  return (
    <div className="flex flex-row gap-4">
      <SessionCalendar session = {session}/>
      <SmallDirectoryBlock sessionId={session.id} />
    </div>
  );
}