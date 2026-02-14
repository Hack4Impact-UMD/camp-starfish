import { getSectionsBySessionId } from "@/data/firestore/sections";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useSections(sessionId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['sessions', sessionId, 'sections'],
    queryFn: async () => {
      const sections = await getSectionsBySessionId(sessionId);
      sections.forEach(section => queryClient.setQueryData(['sessions', sessionId, 'sections', section.id], section));
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
