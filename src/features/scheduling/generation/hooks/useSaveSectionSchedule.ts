import { setSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { objectEntries } from "@/utils/types/typeUtils";
import { useMutation } from "@tanstack/react-query";
import { sectionScheduleQueryOptions } from "@/hooks/schedules/useSectionSchedule";
import { Timestamp } from "firebase/firestore";

interface SaveSectionScheduleRequest {
  sectionSchedule: SectionSchedule;
}

async function saveSectionSchedule(req: SaveSectionScheduleRequest) {
  const { sectionSchedule } = req;
  const { sessionId, sectionId, ...doc } = sectionSchedule;
  await setSectionScheduleDoc(sessionId, sectionId, {
    ...doc,
    blocks: objectEntries(doc.blocks).reduce((acc, [blockId, block]) => ({
      ...acc,
      [blockId]: {
        ...block,
        startTime: Timestamp.fromDate(block.startTime.toDate()),
        endTime: Timestamp.fromDate(block.endTime.toDate())
      }
    }), {})
  });
}

export default function useSaveSectionSchedule() {
  return useMutation({
    mutationFn: (req: SaveSectionScheduleRequest) => saveSectionSchedule(req),
    onSuccess: (_data, { sectionSchedule }, _onMutateResult, { client }) => {
      const { queryKey } = sectionScheduleQueryOptions(sectionSchedule.sessionId, sectionSchedule.sectionId);
      // Show the saved schedule immediately instead of the stale cached one while refetching
      client.setQueryData(queryKey, sectionSchedule);
      return client.invalidateQueries({ queryKey });
    },
  })
}