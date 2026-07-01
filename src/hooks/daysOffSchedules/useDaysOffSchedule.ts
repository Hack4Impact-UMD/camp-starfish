import { getDaysOffScheduleDoc } from "@/data/firestore/daysOffSchedules";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function getUseDaysOffScheduleOptions(sessionId: string) {
  return queryOptions({
    queryKey: ['sessions', sessionId, 'daysOffSchedule'],
    queryFn: () => getDaysOffScheduleDoc(sessionId),
  });
}

export default function useDaysOffSchedule(sessionId: string) {
  return useQuery(getUseDaysOffScheduleOptions(sessionId));
}