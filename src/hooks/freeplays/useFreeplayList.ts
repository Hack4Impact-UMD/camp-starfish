import { listFreeplayDocs } from "@/data/firestore/freeplays";
import { FreeplayDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { Freeplay } from "@/types/sessions/sessionTypes";
import { infiniteQueryOptions, skipToken, useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";
import { flattenFirestoreInfiniteData } from "../utils";

export function getUseFreeplayListOptions(sessionId: string | undefined, firestoreQueryOptions: FirestoreQueryOptions<FreeplayDoc> = {}) {
  return infiniteQueryOptions({
    queryKey: ['sessions', sessionId, 'freeplays', firestoreQueryOptions],
    queryFn: sessionId ? (async ({ pageParam, client }) => {
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
      const freeplaysPage = await listFreeplayDocs(sessionId, updatedQueryOptions);
      freeplaysPage.docs.forEach((freeplay: Freeplay) => client.setQueryData(['sessions', sessionId, 'freeplays', freeplay.date.format("YYYY-MM-DD")], freeplay))
      return freeplaysPage;
    }) : skipToken,
    initialPageParam: undefined as TanstackQueryFirestorePageParam<FreeplayDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
    select: flattenFirestoreInfiniteData
  });
}

export default function useFreeplayList(sessionId: string | undefined, firestoreQueryOptions: FirestoreQueryOptions<FreeplayDoc> = {}) {
  return useInfiniteQuery(getUseFreeplayListOptions(sessionId, firestoreQueryOptions));
}