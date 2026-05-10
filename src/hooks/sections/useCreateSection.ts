import { createSectionDoc } from "@/data/firestore/sections";
import { SectionType } from "@/types/sessions/sessionTypes";
import { useMutation } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Moment } from "moment";

interface CreateSectionRequest {
  sessionId: string;
  name: string;
  startDate: Moment;
  endDate: Moment;
  type: SectionType;
}

async function createSection(req: CreateSectionRequest) {
  const { sessionId, ...rest } = req;
  await createSectionDoc(sessionId, {
    name: rest.name,
    startDate: Timestamp.fromDate(rest.startDate.toDate()),
    endDate: Timestamp.fromDate(rest.endDate.toDate()),
    type: rest.type,
    publishedAt: null
  })
}

export default function useCreateSection() {
  return useMutation({
    mutationFn: (req: CreateSectionRequest) => createSection(req),
    onSuccess: (_data, { sessionId }, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections'] });
    }
  });
}