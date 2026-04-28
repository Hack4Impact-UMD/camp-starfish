import { getNightSchedulesBySessionId } from "@/data/firestore/nightSchedules";
import { useQuery } from "@tanstack/react-query";

export default function useNightSchedulesBySessionId(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'nightSchedules'],
    queryFn: () => getNightSchedulesBySessionId(sessionId),
  });
}