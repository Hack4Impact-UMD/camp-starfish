import { db } from "@/config/firebase";
import { getSectionScheduleDoc, updateSectionScheduleDoc } from "@/data/firestore/sectionSchedules";
import { isBundleSectionSchedule, isBunkJamboreeSectionSchedule } from "@/types/scheduling/schedulingTypeGuards";
import { BundleActivityWithAssignments, BunkJamboreeActivityWithAssignments, NonBunkJamboreeActivityWithAssignments } from "@/types/scheduling/schedulingTypes";
import { AGE_GROUPS } from "@/types/sessions/sessionTypes";
import { useMutation } from "@tanstack/react-query";
import { arrayUnion, runTransaction, Transaction } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

export const CreateJamboreeActivityRequestSchema = z.strictObject({
  sessionId: z.uuid(),
  sectionId: z.uuid(),
  blockId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  programAreaId: z.never().optional(),
  ageGroup: z.never().optional(),
});
export type CreateJamboreeActivityRequest = z.infer<typeof CreateJamboreeActivityRequestSchema>;

export const CreateBundleActivityRequestSchema = z.strictObject({
  sessionId: z.uuid(),
  sectionId: z.uuid(),
  blockId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  programAreaId: z.string().min(1),
  ageGroup: z.enum(AGE_GROUPS)
});
export type CreateBundleActivityRequest = z.infer<typeof CreateBundleActivityRequestSchema>;

export const CreateActivityRequestSchema = z.union([CreateJamboreeActivityRequestSchema, CreateBundleActivityRequestSchema]);
export type CreateActivityRequest = z.infer<typeof CreateActivityRequestSchema>;

async function createActivity(req: CreateActivityRequest) {
  await runTransaction(db, async (transaction: Transaction) => {
    const sectionSchedule = await getSectionScheduleDoc(req.sessionId, req.sectionId, transaction);
    if (isBundleSectionSchedule(sectionSchedule)) {
      const inputValidationResult = CreateBundleActivityRequestSchema.safeParse(req);
      if (!inputValidationResult.success) {
        throw new Error("Invalid input");
      }
      const { sessionId, sectionId, blockId, ...rest } = inputValidationResult.data;
      if (sectionSchedule.blocks[blockId].activities.some((act) => act.programAreaId === rest.programAreaId)) {
        throw new Error("Cannot have multiple activities in the same block and program area");
      }
      await updateSectionScheduleDoc(sessionId, sectionId, {
        [`blocks.${blockId}.activities`]: arrayUnion({
          id: uuidv4(),
          camperIds: [],
          staffIds: [],
          adminIds: [],
          ...rest,
        } satisfies BundleActivityWithAssignments)
      }, transaction);
    } else {
      const inputValidationResult = CreateJamboreeActivityRequestSchema.safeParse(req);
      if (!inputValidationResult.success) {
        throw new Error("Invalid input");
      }
      const { sessionId, sectionId, blockId, ...rest } = inputValidationResult.data;
      if (sectionSchedule.blocks[blockId].activities.some((act) => act.name === rest.name)) {
        throw new Error("Cannot have multiple activities in the same block with the same name");
      }
      await updateSectionScheduleDoc(sessionId, sectionId, {
        [`blocks.${blockId}.activities`]: arrayUnion(isBunkJamboreeSectionSchedule(sectionSchedule) ? {
          id: uuidv4(),
          bunkNums: [],
          adminIds: [],
          ...rest,
        } satisfies BunkJamboreeActivityWithAssignments : {
          id: uuidv4(),
          camperIds: [],
          staffIds: [],
          adminIds: [],
          ...rest
        } satisfies NonBunkJamboreeActivityWithAssignments)
      }, transaction);
    }
  })
}

export default function useCreateActivity() {
  return useMutation({
    mutationFn: (req: CreateActivityRequest) => createActivity(req),
    onSuccess: (_data, { sessionId, sectionId }, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions', sessionId, 'sections', sectionId, 'schedule'] });
    }
  })
}