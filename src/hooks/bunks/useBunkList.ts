import { BunkDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { Bunk } from "@/types/sessions/sessionTypes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";
import { listBunkDocs } from "@/data/firestore/bunks";

export default function useBunkList(sessionId: string, firestoreQueryOptions?: FirestoreQueryOptions<BunkDoc>, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['sessions', sessionId, 'bunks', firestoreQueryOptions],
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
      const bunksPage = await listBunkDocs(sessionId, updatedQueryOptions);
      bunksPage.docs.forEach((bunk: Bunk) => client.setQueryData(['sessions', sessionId, 'bunks', bunk.bunkNum], bunk))
      return bunksPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<BunkDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
    enabled
  });
}