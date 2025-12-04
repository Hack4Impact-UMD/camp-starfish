import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/data/firestore/sessions";
import {
  getSectionScheduleBySectionId,
  getSectionById,
  freeplayConverter,
  attendeeConverter,
} from "@/data/firestore/sections";
import {
  AdminAttendeeID,
  CamperAttendeeID,
  FreeplayID,
  SchedulingSectionType,
  SectionScheduleID,
  StaffAttendeeID,
  SessionID,
  AttendeeID,
  CamperAttendee,
  StaffAttendee,
  AdminAttendee,
  Freeplay,
} from "@/types/sessionTypes";
import { db } from "@/config/firebase";
import { collection, CollectionReference } from "firebase/firestore";
import { Collection, SessionsSubcollection } from "@/data/firestore/utils";
import { executeQuery } from "@/data/firestore/firestoreClientOperations";

interface UseSectionPageDataParams {
  sessionId: string | undefined;
  sectionId: string | undefined;
  fetchSession?: (sessionId: string) => Promise<SessionID>;
}

export function useSectionPageData({
  sessionId,
  sectionId,
  fetchSession = getSessionById,
}: UseSectionPageDataParams) {
  // FETCH SESSION DATA
  const {
    data: session,
    isLoading: isLoadingSession,
    isError,
    error,
  } = useQuery<SessionID>({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId as string),
    enabled: !!sessionId,
    retry: 2,
  });

  // FETCH SECTION DATA
  const { data: section } = useQuery({
    queryKey: ["section", sessionId, sectionId],
    queryFn: async () => {
      if (!sessionId || !sectionId) return null;
      return await getSectionById(sectionId, sessionId);
    },
    enabled: !!sessionId && !!sectionId,
  });

  // FETCH SCHEDULE DATA
  const { data: schedule } = useQuery<
    SectionScheduleID<SchedulingSectionType> | null
  >({
    queryKey: ["schedule", sessionId, sectionId],
    queryFn: async () => {
      if (!sessionId || !sectionId) return null;
      return await getSectionScheduleBySectionId(sectionId, sessionId);
    },
    enabled: !!sessionId && !!sectionId,
  });

  // FETCH FREEPLAY DATA
  const { data: freeplay } = useQuery<FreeplayID | null>({
    queryKey: ["freeplay", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      try {
        const freeplaysRef = collection(
          db,
          Collection.SESSIONS,
          sessionId,
          SessionsSubcollection.FREEPLAYS
        ) as CollectionReference<FreeplayID, Freeplay>;
        const freeplays = await executeQuery<FreeplayID, Freeplay>(
          freeplaysRef,
          freeplayConverter
        );
        return freeplays.length > 0 ? freeplays[0] : null;
      } catch {
        return null;
      }
    },
    enabled: !!sessionId,
  });

  // FETCH ATTENDEES DATA
  const { data: attendees } = useQuery<AttendeeID[]>({
    queryKey: ["attendees", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const attendeesRef = collection(
        db,
        Collection.SESSIONS,
        sessionId,
        SessionsSubcollection.ATTENDEES
      ) as CollectionReference<
        AttendeeID,
        CamperAttendee | StaffAttendee | AdminAttendee
      >;
      return await executeQuery<
        AttendeeID,
        CamperAttendee | StaffAttendee | AdminAttendee
      >(attendeesRef, attendeeConverter);
    },
    enabled: !!sessionId,
  });

  // Separate attendees by role
  const campers = (attendees || []).filter(
    (a): a is CamperAttendeeID => a.role === "CAMPER"
  );
  const staff = (attendees || []).filter(
    (a): a is StaffAttendeeID => a.role === "STAFF"
  );
  const admins = (attendees || []).filter(
    (a): a is AdminAttendeeID => a.role === "ADMIN"
  );

  return {
    session,
    section,
    schedule,
    freeplay,
    attendees,
    campers,
    staff,
    admins,
    isLoading: isLoadingSession,
    isError,
    error,
  };
}