import { useQuery } from "@tanstack/react-query";
import { listSessionDocs } from "@/data/firestore/sessions";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { SessionDoc } from "@/data/firestore/types/documents";

export default function useSessionList(options: FirestoreQueryOptions<SessionDoc> = {}) {
  return useQuery({
    queryKey: ["sessions", options],
    queryFn: () => listSessionDocs(options),
  });
}
