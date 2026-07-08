import { getActivityPreferencesDoc } from "@/data/firestore/activityPreferences";
import { queryOptions, useQuery } from "@tanstack/react-query";

interface UseActivityPreferencesRequest {
  sessionId: string;
  sectionId: string;
}

export function getUseActivityPreferencesOptions(req: UseActivityPreferencesRequest) {
  const { sessionId, sectionId } = req;
  return queryOptions({
    queryKey: ['sessions', sessionId, 'sections', sectionId, 'activityPreferences'],
    queryFn: () => getActivityPreferencesDoc(sessionId, sectionId)
  })
}

export default function useActivityPreferences(req: UseActivityPreferencesRequest) {
  return useQuery(getUseActivityPreferencesOptions(req));
}