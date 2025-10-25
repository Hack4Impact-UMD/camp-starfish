"use client";

import SessionsPage from "@/components/SessionPage";
import { Session } from "@/types/sessionTypes";

const mockSessions: Session[] = [
  // Current session (active now)
  {
    name: "Session C - Current",
    startDate: "2025-10-20",
    endDate: "2025-10-30",
    driveFolderId: "3",
  },
  // Future sessions
  {
    name: "Session D - Winter",
    startDate: "2025-11-10",
    endDate: "2025-11-23",
    driveFolderId: "4",
  },
  {
    name: "Session E - Holiday",
    startDate: "2025-12-15",
    endDate: "2025-12-28",
    driveFolderId: "5",
  },
  // Past sessions
  {
    name: "Session A - Summer",
    startDate: "2025-08-10",
    endDate: "2025-08-23",
    driveFolderId: "1",
  },
  {
    name: "Session B - Fall",
    startDate: "2025-09-01",
    endDate: "2025-09-14",
    driveFolderId: "2",
  },
];

export default function Page() {
  return (
    <SessionsPage
      sessions={mockSessions}
      onCreateSession={() => console.log("Create Session clicked")}
      onEditSession={(session) =>
        console.log("Editing session:", session.name)
      }
    />
  );
}