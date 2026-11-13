import { updateSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { BlockDoc, SectionScheduleDoc } from "@/data/firestore/types/documents";
import { uuidv4, UUIDV4Schema } from "@/types/utils/idTypes";
import { TimeOnlyMomentSchema } from "@/utils/timeUtils";
import { useMutation } from "@tanstack/react-query";
import { Timestamp, UpdateData } from "firebase/firestore";
import z from "zod";

const CreateBlockRequestSchema = z.object({
  sessionId: UUIDV4Schema,
  sectionId: UUIDV4Schema,
  startTime: TimeOnlyMomentSchema,
  endTime: TimeOnlyMomentSchema
}).refine((req) => req.endTime.isAfter(req.startTime), {
  error: "End time must be after start time"
});
type CreateBlockRequest = z.infer<typeof CreateBlockRequestSchema>;

async function createBlock(req: CreateBlockRequest) {
  const valResult = CreateBlockRequestSchema.parse(req);
  const { sessionId, sectionId, startTime, endTime } = valResult;
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