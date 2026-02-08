import { updateSection } from "@/data/firestore/sections";
import { useMutation } from "@tanstack/react-query";
import { deleteField } from "firebase/firestore";

export async function unpublishSectionSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSection(sectionId, sessionId, { publishedAt: deleteField() });
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
