import { updateSection } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";

export async function unpublishSectionSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSection(sectionId, sessionId, { isPublished: false });
}

interface UnpublishSectionSecheduleParams {
  sessionId: string;
  sectionId: string;
}

export function usePublishSectionSchedule() {
  return useMutation({
    mutationFn: ({ sessionId, sectionId }: UnpublishSectionSecheduleParams) => unpublishSectionSchedule(sessionId, sectionId)
  })
}
