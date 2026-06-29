import { getDaysOffScheduleDoc } from "@/data/firestore/daysOffSchedules";
import { useQuery } from "@tanstack/react-query";

export default function useDaysOffSchedule(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'daysOffSchedule'],
    queryFn: () => getDaysOffScheduleDoc(sessionId),
  })
}