import { updateSection } from "@/data/firestore/sections";

export async function publishSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSection(sectionId, sessionId, { isPublished: true });
}

export async function unpublishSchedule(sessionId: string, sectionId: string): Promise<void> {
  await updateSection(sectionId, sessionId, { isPublished: false });
}