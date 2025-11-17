import { useQuery } from "@tanstack/react-query";
import { SectionID } from "@/types/sessionTypes";
import { getSectionById } from "@/data/firestore/sections";

interface UseSectionParams {
  sessionId: string;
  enabled?: boolean;
}

export function useSection({ sessionId, enabled = true }: UseSectionParams) {
  return useQuery<SectionID>({
    queryKey: ["section", sessionId],
    enabled: enabled && !!sessionId,
    queryFn: () => getSectionById(sessionId),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
