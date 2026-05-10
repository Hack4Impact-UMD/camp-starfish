import { getFreeplayDoc } from "@/data/firestore/freeplays";
import { useQuery, skipToken } from "@tanstack/react-query";
import { Moment } from "moment";

export default function useFreeplay(sessionId: string | undefined, freeplayDate: Moment | undefined) {
  const freeplayDateStr = freeplayDate?.format("YYYY-MM-DD");
  return useQuery({
    queryKey: ["sessions", sessionId, "freeplays", freeplayDateStr],
    queryFn: sessionId && freeplayDate ? () => getFreeplayDoc(sessionId, freeplayDate) : skipToken,
  })
}