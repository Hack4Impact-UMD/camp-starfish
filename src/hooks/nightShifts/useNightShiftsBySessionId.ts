import { getNightSchedulesBySessionId } from "@/data/firestore/nightSchedules";
import { useQuery } from "@tanstack/react-query";

export default function useNightShiftsBySessionId(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'nightShifts'],
    queryFn: () => getNightSchedulesBySessionId(sessionId),
  });
}