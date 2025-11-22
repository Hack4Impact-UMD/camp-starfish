"use client";

import useSession from "@/hooks/sessions/useSession";
import LoadingPage from "@/app/loading";
import SessionPage from "./SessionPage";

interface SessionPageWrapperProps {
  params: {
    sessionId: string;
  };
}

export default function SessionPageWrapper(props: SessionPageWrapperProps) {
  const { sessionId } = props.params;
  const { data: session, status } = useSession(sessionId);

  switch (status) {
    case 'pending': return <LoadingPage />;
    case 'error': return <p>Error loading session data</p>;
    case 'success': return <SessionPage session={session} />
  }
}
