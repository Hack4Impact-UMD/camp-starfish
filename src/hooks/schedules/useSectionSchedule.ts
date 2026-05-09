import { getSectionSchedule } from "@/data/firestore/sectionSchedules";
import { skipToken, useQuery } from "@tanstack/react-query";

export default function useSectionSchedule(sessionId: string | undefined, sectionId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'],
    queryFn: sessionId && sectionId ? (() => getSectionSchedule(sessionId, sectionId)) : skipToken,
  });
}