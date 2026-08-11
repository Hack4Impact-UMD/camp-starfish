import { getSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

export function sectionScheduleQueryOptions(sessionId: string, sectionId: string) {
  return queryOptions({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'],
    queryFn: () => getSectionScheduleDoc(sessionId, sectionId)
  });
}

export default function useSectionSchedule(sessionId: string, sectionId: string, enabled: boolean = true) {
  const defaultOptions = sectionScheduleQueryOptions(sessionId, sectionId);
  return useQuery({
    ...defaultOptions,
    queryFn: enabled ? defaultOptions.queryFn : skipToken
  });
}