<<<<<<< HEAD
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
=======
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
>>>>>>> c46a1c9377478ac5a045986a593c8b77654152f0
