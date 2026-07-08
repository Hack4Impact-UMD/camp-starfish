import { updateSectionDoc } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";

export async function publishSectionSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSectionDoc(sessionId, sectionId, { publishedAt: Timestamp.now() });
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
