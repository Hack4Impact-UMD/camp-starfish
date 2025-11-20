"use client";

import { useEffect, useState } from "react";
import { SessionID } from "@/types/sessionTypes";
import SessionsPage from "@/components/SessionsPage";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Collection, SessionsSubcollection } from "@/data/firestore/utils";
import LoadingPage from "@/app/loading";

interface StaffSessionsViewProps {
  sessions: SessionID[];
  userUid?: string | number | null; // accept either Firebase uid (string) or numeric campminderId
}

export default function StaffSessionsView({ sessions, userUid }: StaffSessionsViewProps) {
  const [allowedIds, setAllowedIds] = useState<Set<string> | null>(null);
  const idStr = userUid == null ? null : String(userUid);

  useEffect(() => {
    let mounted = true;
    if (!idStr) {
      // if no id available, no sessions are allowed for staff
      setAllowedIds(new Set());
      return;
    }

    setAllowedIds(null); // loading state

    (async () => {
      try {
        // check each session for an attendee doc matching idStr
        const results = await Promise.all(
          sessions.map(async (s) => {
            const ref = doc(db, Collection.SESSIONS, s.id, SessionsSubcollection.ATTENDEES, idStr);
            const snap = await getDoc(ref);
            const exists = snap.exists();
            return { id: s.id, exists };
          })
        );
        if (!mounted) return;
        const allowed = new Set(results.filter((r) => r.exists).map((r) => r.id));
        setAllowedIds(allowed);
      } catch {
        if (!mounted) return;
        // on error, show no sessions
        setAllowedIds(new Set());
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sessions, userUid]);

  if (allowedIds === null) { 
    return <LoadingPage />
  }

  const filtered = sessions.filter((s) => allowedIds.has(s.id));

  return <SessionsPage sessions={filtered} />;
}
