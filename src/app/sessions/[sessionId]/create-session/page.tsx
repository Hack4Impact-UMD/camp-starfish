"use client";
import SessionCalendar from "@/components/SessionCalendar";
import { useSessionContext } from "./../SessionContext";


export default function Page() {
  const session = useSessionContext();
  return <SessionCalendar session={session}/>;
}