import { listFreeplayDocs } from "@/data/firestore/freeplays";
import { FreeplayDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { skipToken, useQuery } from "@tanstack/react-query";

export default function useFreeplayList(sessionId: string | undefined, firestoreQueryOptions?: FirestoreQueryOptions<FreeplayDoc>) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'freeplays', firestoreQueryOptions],
    queryFn: sessionId ? (() => listFreeplayDocs(sessionId, firestoreQueryOptions)) : skipToken,
  });
}