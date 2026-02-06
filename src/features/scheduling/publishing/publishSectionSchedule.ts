import { updateSection } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";

export async function publishSectionSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSection(sectionId, sessionId, { isSchedulePublished: true });
}

interface PublishSectionSecheduleParams {
  sessionId: string;
  sectionId: string;
}

export function usePublishSectionSchedule() {
  return useMutation({
    mutationFn: ({ sessionId, sectionId }: PublishSectionSecheduleParams) => publishSectionSchedule(sessionId, sectionId)
  })
}
