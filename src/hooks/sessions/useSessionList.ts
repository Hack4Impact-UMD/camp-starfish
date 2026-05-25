import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { SessionDoc } from "@/data/firestore/types/documents";
import { useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";
import { listSessionDocs } from "@/data/firestore/sessions";
import { Session } from "@/types/sessions/sessionTypes";

export default function useSessionList(queryOptions?: FirestoreQueryOptions<SessionDoc>) {
  return useInfiniteQuery({
    queryKey: ['sessions', queryOptions],
    queryFn: async ({ pageParam, client }) => {
      const updatedQueryOptions = queryOptions ? { ...queryOptions } : {};
      if (pageParam) {
        if (pageParam.direction === 'next') {
          updatedQueryOptions.startAfter = pageParam.snapshot;
          updatedQueryOptions.startAt = undefined;
        } else {
          updatedQueryOptions.endBefore = pageParam.snapshot;
          updatedQueryOptions.endAt = undefined;
        }
      }
      const sessionsPage = await listSessionDocs(updatedQueryOptions);
      sessionsPage.docs.forEach((session: Session) => client.setQueryData(['sessions', session.id], session))
      return sessionsPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<SessionDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
  });
}