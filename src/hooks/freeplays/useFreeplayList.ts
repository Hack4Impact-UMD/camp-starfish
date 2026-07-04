import { listFreeplayDocs } from "@/data/firestore/freeplays";
import { FreeplayDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

export function getUseFreeplayListOptions(sessionId: string | undefined, firestoreQueryOptions: FirestoreQueryOptions<FreeplayDoc> = {}) {
  return queryOptions({
    queryKey: ['sessions', sessionId, 'freeplays', firestoreQueryOptions],
    queryFn: sessionId ? (() => listFreeplayDocs(sessionId, firestoreQueryOptions)) : skipToken,
  });
}

export default function useFreeplayList(sessionId: string | undefined, firestoreQueryOptions: FirestoreQueryOptions<FreeplayDoc> = {}) {
  return useQuery(getUseFreeplayListOptions(sessionId, firestoreQueryOptions));
}