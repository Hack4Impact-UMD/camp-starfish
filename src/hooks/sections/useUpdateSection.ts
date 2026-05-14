import { updateSectionDoc } from "@/data/firestore/sections";
import { SectionType } from "@/types/sessions/sessionTypes";
import { useMutation } from "@tanstack/react-query";
import { deleteField, Timestamp } from "firebase/firestore";
import { Moment } from "moment";

interface UpdateSectionRequest {
  sessionId: string;
  sectionId: string;
  name?: string;
  startDate?: Moment;
  endDate?: Moment;
  type?: SectionType;
}

async function updateSection(req: UpdateSectionRequest) {
  const { sessionId, sectionId, ...updates } = req;
  switch (updates.type) {
    case "COMMON":
      await updateSectionDoc(sessionId, sectionId, {
        name: updates.name,
        startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.toDate()) : undefined,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.toDate()) : undefined,
        type: "COMMON",
        publishedAt: deleteField()
      });
      break;
    case "BUNDLE":
    case "BUNK-JAMBO":
    case "NON-BUNK-JAMBO":
      await updateSectionDoc(sessionId, sectionId, {
        name: updates.name,
        startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.toDate()) : undefined,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.toDate()) : undefined,
        type: updates.type,
        publishedAt: null
      });
      break;
    default:
      await updateSectionDoc(sessionId, sectionId, {
        name: updates.name,
        startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.toDate()) : undefined,
        endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.toDate()) : undefined,
      });
  }


  await updateSectionDoc(sessionId, sectionId, {
    type: "BUNK-JAMBO",
  });
}

export default function useUpdateSection() {
  return useMutation({
    mutationFn: (req: UpdateSectionRequest) => updateSection(req),
    onSuccess: (_data, { sectionId, sessionId }, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections', sectionId] });
    }
  });
}