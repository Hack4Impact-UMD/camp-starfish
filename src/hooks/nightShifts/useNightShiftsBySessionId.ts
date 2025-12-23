import { getNightShiftsBySessionId } from "@/data/firestore/nightShifts";
import { useQuery } from "@tanstack/react-query";

export default function useNightShiftsBySessionId(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'nightShifts'],
    queryFn: () => getNightShiftsBySessionId(sessionId),
  });
}