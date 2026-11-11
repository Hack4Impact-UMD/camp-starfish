import { z } from "zod";
import { isMoment, Moment } from "moment";
import { AGE_GROUPS } from "@/types/sessions/sessionTypes";

const ids = z.array(z.number().int());
const baseActivity = {
  name: z.string(),
  description: z.string(),
};
const individual = { camperIds: ids, staffIds: ids, adminIds: ids };
const individualActivity = z.object({ ...baseActivity, ...individual });
const bundleActivity = z.object({
  ...baseActivity,
  ...individual,
  programAreaId: z.string(),
  ageGroup: z.enum(AGE_GROUPS),
});
const bunkActivity = z.object({
  ...baseActivity,
  bunkNums: ids,
  adminIds: ids,
});
const block = <T extends z.ZodType>(activity: T) =>
  z.object({
    startTime: z.custom<Moment>((value) => isMoment(value) && value.isValid(), "Expected a valid Moment date"),
    endTime: z.custom<Moment>((value) => isMoment(value) && value.isValid(), "Expected a valid Moment date"),
    activities: z.record(z.string(), activity),
    periodsOff: ids,
  });
const baseSchedule = {
  sessionId: z.string(),
  sectionId: z.string(),
  alternatePeriodsOff: z.record(z.string(), ids),
};
const blocks = <T extends z.ZodType>(activity: T) =>
  z
    .record(z.string(), block(activity))
    .refine((value) => Object.keys(value).length > 0, "A section schedule must contain at least one block");

export const sectionScheduleSchema = z.discriminatedUnion("type", [ z.object({
  ...baseSchedule,
  type: z.literal("BUNDLE"),
  blocks: blocks(bundleActivity),
}), z.object({
  ...baseSchedule,
  type: z.literal("BUNK-JAMBO"),
  blocks: blocks(bunkActivity),
}), z.object({
  ...baseSchedule,
  type: z.literal("NON-BUNK-JAMBO"),
  blocks: blocks(individualActivity),
}), ]);

export const nightScheduleSchema = z.object({
  sessionId: z.string(),
  date: z.custom<Moment>((value) => isMoment(value) && value.isValid(), "Expected a valid Moment date"),
  bunks: z.record(z.string().regex(/^\d+$/), z.object({
    "COUNSELOR-ON-DUTY": ids,
    "NIGHT-BUNK-DUTY": ids,
    ROVER: ids,
  })),
});
