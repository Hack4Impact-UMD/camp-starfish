import { getFreeplayById } from "@/data/firestore/freeplays";
import { useQuery } from "@tanstack/react-query";

export default function useFreeplay(sessionId: string, freeplayId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId, "freeplays", freeplayId],
    queryFn: () => getFreeplayById(sessionId, freeplayId),
    enabled: !!sessionId && !!freeplayId
  })
}