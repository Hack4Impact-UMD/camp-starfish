import { db } from "@/config/firebase";
import { updateActivityPreferencesDoc } from "@/data/firestore/activityPreferences";
import { updateSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { UUIDV4Schema } from "@/types/utils/idTypes";
import { useMutation } from "@tanstack/react-query";
import { deleteField, runTransaction, Transaction } from "firebase/firestore";
import z from "zod";

const DeleteBlockRequestSchema = z.object({
  sessionId: z.string(),
  sectionId: z.string(),
  blockId: UUIDV4Schema,
});
type DeleteBlockRequest = z.infer<typeof DeleteBlockRequestSchema>;

async function deleteBlock(req: DeleteBlockRequest) {
  const valResult = DeleteBlockRequestSchema.parse(req);
  const { sessionId, sectionId, blockId } = valResult;
  await runTransaction(db, async (tx: Transaction) => {
    await Promise.all([
      updateSectionScheduleDoc(sessionId, sectionId, { [`blocks.${blockId}`]: deleteField() }, tx),
      updateActivityPreferencesDoc(sessionId, sectionId, { [`blocks.${blockId}`]: deleteField() }, tx)
    ]);
    
  })
}

export default function useDeleteBlock() {
  return useMutation({
    mutationKey: ['delete-block'],
    mutationFn: deleteBlock,
    onSuccess: (_data, variables, _onMutateResult, { client }) => {
      const { sessionId, sectionId } = variables;
      client.invalidateQueries({
        predicate: (query) => query.queryHash === JSON.stringify(['sessions', sessionId, 'sections', sectionId, 'schedule']) ||
          query.queryHash === JSON.stringify(['sessions', sessionId, 'sections', sectionId, 'activityPreferences'])
      })
    },
  })
}