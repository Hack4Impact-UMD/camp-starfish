import { queryOptions, useQuery } from "@tanstack/react-query";
import { listAttendeeDocs } from "@/data/firestore/attendees";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { AttendeeDoc } from "@/data/firestore/types/documents";

export function getUseAttendeeListOptions(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<AttendeeDoc> = {}) {
  return queryOptions({
    queryKey: ['sessions', sessionId, 'attendees', firestoreQueryOptions],
    queryFn: () => listAttendeeDocs(sessionId, firestoreQueryOptions),
  });
}

export default function useAttendeeList(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<AttendeeDoc> = {}) {
  return useQuery(getUseAttendeeListOptions(sessionId, firestoreQueryOptions));
}