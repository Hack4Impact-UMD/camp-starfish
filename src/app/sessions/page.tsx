"use client";

import SessionsPage from "@/components/SessionsPage";
import { useSessions } from "@/hooks/sessions/useSessions";
import LoadingPage from "../loading";

export default function Page() {
  const { data: sessions, isLoading, isError } = useSessions();
  if (isLoading) return <LoadingPage />;
  if (isError) return <p>Error loading sessions.</p>;
  return <SessionsPage sessions={sessions || []} />;
}
