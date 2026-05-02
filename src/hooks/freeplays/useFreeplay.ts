import { getFreeplayById } from "@/data/firestore/freeplays";
import { useQuery, skipToken } from "@tanstack/react-query";

export default function useFreeplay(sessionId: string | undefined, freeplayId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", sessionId, "freeplays", freeplayId],
    queryFn: sessionId && freeplayId ? () => getFreeplayById(sessionId, freeplayId) : skipToken,
  })
}