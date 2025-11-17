import { useQuery } from "@tanstack/react-query";
import { SectionID } from "@/types/sessionTypes";

interface UseSectionParams {
  sessionId: string;
  enabled?: boolean;
}

export function useSection({ sessionId, enabled = true }: UseSectionParams) {
  return useQuery<SectionID>({
    queryKey: ["section", sessionId],
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
