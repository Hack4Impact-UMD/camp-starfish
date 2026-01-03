import { getSectionById } from "@/data/firestore/sections";
import { useQuery } from "@tanstack/react-query";

export default function useSection(sessionId: string, sectionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', sectionId],
    queryFn: () => getSectionById(sessionId, sectionId),
    enabled: !!sessionId && !!sectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}