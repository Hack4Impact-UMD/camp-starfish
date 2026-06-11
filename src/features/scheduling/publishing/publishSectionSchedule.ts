import { updateSectionDoc } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";

export async function publishSectionSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSectionDoc(sessionId, sectionId, { publishedAt: moment().toISOString() });
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
