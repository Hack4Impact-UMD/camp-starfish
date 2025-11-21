import { updateSection } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";

export async function publishSectionSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSection(sectionId, sessionId, { isPublished: true });
}

interface PublishSectionSecheduleParams {
  sessionId: string;
  sectionId: string;
}

export function usePublishSectionSchedule(params: PublishSectionSecheduleParams) {
  return useMutation({
    mutationFn: ({ sessionId, sectionId }: PublishSectionSecheduleParams) => publishSectionSchedule(sessionId, sectionId)
  })
}
