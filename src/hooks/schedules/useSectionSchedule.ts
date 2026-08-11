import { getSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

export function sectionScheduleQueryOptions(sessionId: string | undefined, sectionId: string | undefined, enabled: boolean = true) {
  return queryOptions({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'],
    queryFn: sessionId && sectionId && enabled ? (() => getSectionScheduleDoc(sessionId, sectionId)) : skipToken
  });
}

export default function useSectionSchedule(sessionId: string | undefined, sectionId: string | undefined, enabled: boolean = true) {
  return useQuery(sectionScheduleQueryOptions(sessionId, sectionId, enabled));
}