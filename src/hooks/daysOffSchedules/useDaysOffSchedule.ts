import { getDaysOffDoc } from "@/data/firestore/daysOff";
import { useQuery } from "@tanstack/react-query";

export default function useDaysOffSchedule(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'daysOffSchedule'],
    queryFn: () => getDaysOffDoc(sessionId),
  })
}