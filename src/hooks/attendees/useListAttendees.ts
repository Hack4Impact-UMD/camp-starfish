import { useQuery } from "@tanstack/react-query";
import { listAttendeeDocs } from "@/data/firestore/attendees";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { AttendeeDoc } from "@/data/firestore/types/documents";

export default function useListAttendees(sessionId: string, firestoreQueryOptions?: FirestoreQueryOptions<AttendeeDoc>) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'attendees', firestoreQueryOptions],
    queryFn: () => listAttendeeDocs(sessionId, firestoreQueryOptions),
  });
}