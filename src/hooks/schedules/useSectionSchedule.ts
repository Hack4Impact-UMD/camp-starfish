import { isNotFoundError } from "@/data/firestore/firestoreClientOperations";
import { getSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { skipToken, useQuery } from "@tanstack/react-query";

export default function useSectionSchedule(sessionId: string | undefined, sectionId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'],
    queryFn: sessionId && sectionId && enabled ? (() => getSectionScheduleDoc(sessionId, sectionId)) : skipToken,
    // A missing schedule doc is the normal "not generated yet" state, not a transient failure
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 3,
  });
}