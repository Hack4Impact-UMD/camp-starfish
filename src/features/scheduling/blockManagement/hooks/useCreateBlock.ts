import { db } from "@/config/firebase";
import { getActivityPreferencesDoc, updateActivityPreferencesDoc } from "@/data/firestore/activityPreferences";
import { updateSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { BlockDoc, SectionScheduleDoc } from "@/data/firestore/types/documents";
import { uuidv4, UUIDV4Schema } from "@/types/utils/idTypes";
import { TimeOnlyMomentSchema } from "@/utils/timeUtils";
import { useMutation } from "@tanstack/react-query";
import { runTransaction, Timestamp, Transaction, UpdateData } from "firebase/firestore";
import z from "zod";
import * as SessionUtils from "@/types/sessions/sessionUtils";
import { getSessionDoc } from "@/data/firestore/sessions";

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
  await runTransaction(db, async (tx: Transaction) => {
    const session = await getSessionDoc(sessionId, tx);
    const sectionScheduleUpdate = updateSectionScheduleDoc(sessionId, sectionId, {
      [`blocks.${blockId}`]: {
        activities: {},
        periodsOff: [],
        startTime: Timestamp.fromDate(startTime.toDate()),
        endTime: Timestamp.fromDate(endTime.toDate())
      } satisfies BlockDoc
    } as unknown as UpdateData<SectionScheduleDoc>, tx);
    const camperIds = SessionUtils.camperIds(session);
    const activityPrefsUpdate = updateActivityPreferencesDoc(sessionId, sectionId, {
      [`blocks.${blockId}`]: camperIds.reduce((acc, camperId) => ({
        ...acc,
        [camperId]: {}
      }), {})
    }, tx);
    await Promise.all([sectionScheduleUpdate, activityPrefsUpdate]);
    return blockId;
  });
}

export default function useCreateBlock() {
  return useMutation({
    mutationKey: ['create-block'],
    mutationFn: createBlock,
    onSuccess: (_data, variables, _onMutateResult, { client }) => {
      const { sessionId, sectionId } = variables;
      client.invalidateQueries({
        predicate: (query) => query.queryHash === JSON.stringify(['sessions', sessionId, 'sections', sectionId, 'schedule']) ||
          query.queryHash === JSON.stringify(['sessions', sessionId, 'sections', sectionId, 'activityPreferences'])
      })
    },
  })
}