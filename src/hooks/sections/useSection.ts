import { getSectionDoc } from "@/data/firestore/sections";
import { skipToken, useQuery } from "@tanstack/react-query";

export default function useSection(sessionId: string | undefined, sectionId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', sectionId],
    queryFn: sectionId && sessionId ? (() => getSectionDoc(sessionId, sectionId)) : skipToken,
  });
}
