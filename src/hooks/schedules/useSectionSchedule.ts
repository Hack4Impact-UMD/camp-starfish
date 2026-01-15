import { getSectionSchedule } from "@/data/firestore/schedules";
import { useQuery } from "@tanstack/react-query";

export default function useSectionSchedule(sessionId: string, sectionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'],
    queryFn: () => getSectionSchedule(sessionId, sectionId),
  });
}