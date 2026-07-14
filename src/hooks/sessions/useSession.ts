import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSessionDoc } from "@/data/firestore/sessions";

export function getUseSessionOptions(sessionId: string) {
  return queryOptions({
    queryKey: ["sessions", sessionId],
    queryFn: async() => getSessionDoc(sessionId),
  });
}

export default function useSession(sessionId: string) {
  return useQuery(getUseSessionOptions(sessionId));
}