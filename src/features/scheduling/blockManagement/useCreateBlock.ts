import { updateSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { BlockDoc, SectionScheduleDoc } from "@/data/firestore/types/documents";
import { uuidv4 } from "@/types/utils/idTypes";
import { useMutation } from "@tanstack/react-query";
import { Timestamp, UpdateData } from "firebase/firestore";
import { Moment } from "moment";

interface CreateBlockRequest {
  sessionId: string;
  sectionId: string;
  startTime: Moment;
  endTime: Moment;
}

async function createBlock(req: CreateBlockRequest) {
  const { sessionId, sectionId, startTime, endTime } = req;
  const blockId = uuidv4();
  await updateSectionScheduleDoc(sessionId, sectionId, {
    [`blocks.${blockId}`]: {
      activities: {},
      periodsOff: [],
      startTime: Timestamp.fromDate(startTime.toDate()),
      endTime: Timestamp.fromDate(endTime.toDate())
    } satisfies BlockDoc
  } as unknown as UpdateData<SectionScheduleDoc>)
}

export default function useCreateBlock() {
  return useMutation({
    mutationKey: ['create-block'],
    mutationFn: createBlock
  })
}