"use client";

import { useEffect, useState } from "react";
import { SessionID } from "@/types/sessionTypes";
import SessionsPage from "@/components/SessionsPage";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Collection, SessionsSubcollection } from "@/data/firestore/utils";

interface StaffSessionsViewProps {
  sessions: SessionID[];
  // accept either Firebase uid (string) or numeric campminderId
  userUid?: string | number | null;
}

export default function StaffSessionsView({ sessions, userUid }: StaffSessionsViewProps) {
  const [allowedIds, setAllowedIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    let mounted = true;
    const idStr = userUid == null ? null : String(userUid);
    if (!idStr) {
      // if no id available, no sessions are allowed for staff
      setAllowedIds(new Set());
      return;
    }

    setAllowedIds(null); // loading

    (async () => {
      try {
        const results = await Promise.all(
          sessions.map(async (s) => {
            const ref = doc(db, Collection.SESSIONS, s.id, SessionsSubcollection.ATTENDEES, idStr);
            const snap = await getDoc(ref);
            return snap.exists() ? s.id : null;
          })
        );
        if (!mounted) return;
        setAllowedIds(new Set(results.filter(Boolean) as string[]));
      } catch (e) {
        if (!mounted) return;
        // on error, show no sessions to be conservative
        setAllowedIds(new Set());
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sessions, userUid]);

  if (allowedIds === null) {
    return <div>Loading sessions...</div>;
  }

  const filtered = sessions.filter((s) => allowedIds.has(s.id));

  return <SessionsPage sessions={filtered} />;
}
