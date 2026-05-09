import { updateSectionDoc } from "@/data/firestore/sections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Moment } from "moment";

interface UpdateSectionRequest {
  sessionId: string;
  sectionId: string;
  name?: string;
  startDate?: Moment;
  endDate?: Moment;
}

async function updateSection(req: UpdateSectionRequest) {
  const { sessionId, sectionId, ...updates } = req;
  await updateSectionDoc(sessionId, sectionId, {
    name: updates.name,
    startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.toDate()) : undefined,
    endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.toDate()) : undefined,
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