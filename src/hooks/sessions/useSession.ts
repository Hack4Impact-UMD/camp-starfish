import { queryOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getSessionDoc } from "@/data/firestore/sessions";

export function getUseSessionOptions(sessionId: string, tanstackQueryOptions: Omit<UseQueryOptions<Awaited<ReturnType<typeof getSessionDoc>>>, "queryKey" | "queryFn"> = {}) {
  return queryOptions({
    queryKey: ["sessions", sessionId],
    queryFn: () => getSessionDoc(sessionId),
    ...tanstackQueryOptions
  });
}

export default function useSession(sessionId: string, tanstackQueryOptions: Omit<UseQueryOptions<Awaited<ReturnType<typeof getSessionDoc>>>, "queryKey" | "queryFn"> = {}) {
  return useQuery(getUseSessionOptions(sessionId, tanstackQueryOptions));
}