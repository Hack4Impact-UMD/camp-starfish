"use client";

import SessionsPage from "@/components/SessionsPage";
import { useSessions } from "@/hooks/sessions/useSessions";
import moment from "moment";
import LoadingPage from "../loading";

export default function Page() {
  const { data: sessions, isLoading, isError } = useSessions();

  if (isLoading) return <LoadingPage />;
  if (isError) return <p>Error loading sessions.</p>;

  // Format session dates if needed
  const formattedSessions = (sessions ?? []).map((s) => ({
    ...s,
    startDate: moment(s.startDate).format("YYYY-MM-DD"),
    endDate: moment(s.endDate).format("YYYY-MM-DD"),
  }));

  return <SessionsPage sessions={formattedSessions} />;
}
