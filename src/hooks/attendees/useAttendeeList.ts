import { listAttendeeDocs } from "@/data/firestore/attendees";
import { AttendeeDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { Attendee } from "@/types/sessions/sessionTypes";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";

export function getUseAttendeeListOptions(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<AttendeeDoc> = {}) {
  return infiniteQueryOptions({
    queryKey: ['sessions', sessionId, 'attendees', firestoreQueryOptions],
    queryFn: async ({ pageParam, client }) => {
      const updatedQueryOptions = firestoreQueryOptions ? { ...firestoreQueryOptions } : {};
      if (pageParam) {
        if (pageParam.direction === 'next') {
          updatedQueryOptions.startAfter = pageParam.snapshot;
          updatedQueryOptions.startAt = undefined;
        } else {
          updatedQueryOptions.endBefore = pageParam.snapshot;
          updatedQueryOptions.endAt = undefined;
        }
      }
      const attendeesPage = await listAttendeeDocs(sessionId, updatedQueryOptions);
      attendeesPage.docs.forEach((attendee: Attendee) => client.setQueryData(['sessions', sessionId, 'attendees', attendee.attendeeId], attendee));
      return attendeesPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<AttendeeDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
  });
}

export default function useAttendeeList(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<AttendeeDoc> = {}) {
  return useInfiniteQuery(getUseAttendeeListOptions(sessionId, firestoreQueryOptions));
}