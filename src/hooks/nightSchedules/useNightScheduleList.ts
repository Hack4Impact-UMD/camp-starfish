import { listNightScheduleDocs } from "@/data/firestore/nightSchedules";
import { NightScheduleDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { useQuery } from "@tanstack/react-query";

export default function useNightScheduleList(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<NightScheduleDoc> = {}) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'nightSchedules', firestoreQueryOptions],
    queryFn: () => listNightScheduleDocs(sessionId, firestoreQueryOptions),
  });
}