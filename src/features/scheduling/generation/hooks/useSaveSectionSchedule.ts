import { setSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { useMutation } from "@tanstack/react-query";

interface SaveSectionScheduleRequest {
  sectionSchedule: SectionSchedule;
}

async function saveSectionSchedule(req: SaveSectionScheduleRequest) {
  const { sectionSchedule } = req;
  const { sessionId, sectionId, ...doc } = sectionSchedule;
  await setSectionScheduleDoc(sessionId, sectionId, doc);
}

export default function useSaveSectionSchedule() {
  return useMutation({
    mutationFn: (req: SaveSectionScheduleRequest) => saveSectionSchedule(req),
    onSuccess: (_data, { sectionSchedule }, _onMutateResult, { client }) => client.invalidateQueries({ queryKey: ['sessions', sectionSchedule.sessionId, 'sections', sectionSchedule.sectionId, 'schedule'] }),
  })
}