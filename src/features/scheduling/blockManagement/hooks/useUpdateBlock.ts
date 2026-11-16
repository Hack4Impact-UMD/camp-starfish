import { db } from "@/config/firebase";
import { getSectionScheduleDoc, updateSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { UUIDV4Schema } from "@/types/utils/idTypes";
import { TimeOnlyMomentSchema } from "@/utils/timeUtils";
import { useMutation } from "@tanstack/react-query";
import { runTransaction, Timestamp, Transaction } from "firebase/firestore";
import z from "zod";

const UpdateBlockRequestSchema = z.object({
  sessionId: z.string(),
  sectionId: z.string(),
  blockId: UUIDV4Schema,
  startTime: TimeOnlyMomentSchema.optional(),
  endTime: TimeOnlyMomentSchema.optional()
}).refine((obj) => obj.startTime !== undefined || obj.endTime !== undefined, {
  error: "At least 1 update must be provided"
});
type UpdateBlockRequest = z.infer<typeof UpdateBlockRequestSchema>;

async function updateBlock(req: UpdateBlockRequest) {
  const valResult = UpdateBlockRequestSchema.parse(req);
  const { sessionId, sectionId, blockId, ...updates } = valResult;
  await runTransaction(db, async (tx: Transaction) => {
    const sectionSchedule = await getSectionScheduleDoc(sessionId, sectionId, tx);
    if (!(blockId in sectionSchedule.blocks)) {
      throw new Error("Cannot update a block that does not exist");
    }

    const block = sectionSchedule.blocks[blockId];
    const newStartTime = updates.startTime ? updates.startTime : block.startTime;
    const newEndTime = updates.endTime ? updates.endTime : block.endTime;
    if (newEndTime.isSameOrBefore(newStartTime)) {
      throw new Error("End time must be after start time");
    }

    await updateSectionScheduleDoc(sessionId, sectionId, {
      [`blocks.${blockId}.startTime`]: updates.startTime ? Timestamp.fromDate(updates.startTime.toDate()) : undefined,
      [`blocks.${blockId}.endTime`]: updates.endTime ? Timestamp.fromDate(updates.endTime.toDate()) : undefined
    }, tx);
  })
}

export default function useUpdateBlock() {
  return useMutation({
    mutationKey: ['update-block'],
    mutationFn: updateBlock,
    onSuccess: (_data, variables, _onMutateResult, { client }) => {
      const { sessionId, sectionId } = variables;
      client.invalidateQueries({
        predicate: (query) => query.queryHash === JSON.stringify(['sessions', sessionId, 'sections', sectionId, 'schedule'])
      })
    },
  })
}