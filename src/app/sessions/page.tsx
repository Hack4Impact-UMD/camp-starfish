"use client";

import { useEffect, useState } from "react";
import SessionsPage from "@/components/SessionsPage";
import { Session } from "@/types/sessionTypes";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import moment from "moment";

export default function Page() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sessions"));
        const fetchedSessions: Session[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.name,
            startDate: moment(data.startDate).format("YYYY-MM-DD"),
            endDate: moment(data.endDate).format("YYYY-MM-DD"),
            driveFolderId: data.driveFolderId,
          };
        });

        fetchedSessions.sort(
          (a, b) =>
            moment(b.startDate).valueOf() - moment(a.startDate).valueOf()
        );

        setSessions(fetchedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <p>Loading sessions...</p>;
  }

  return <SessionsPage sessions={sessions} />;
}
