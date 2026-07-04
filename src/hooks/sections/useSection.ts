import { getSectionDoc } from "@/data/firestore/sections";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

export function getUseSectionOptions(sessionId: string | undefined, sectionId: string | undefined) {
  return queryOptions({
    queryKey: ['sessions', sessionId, 'sections', sectionId],
    queryFn: sectionId && sessionId ? (() => getSectionDoc(sessionId, sectionId)) : skipToken,

  })
}

export default function useSection(sessionId: string | undefined, sectionId: string | undefined) {
  return useQuery(getUseSectionOptions(sessionId, sectionId));
}
