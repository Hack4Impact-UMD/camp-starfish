import { z } from "zod";
import { AGE_GROUPS } from "@/types/sessions/sessionTypes";
import { NIGHT_SCHEDULE_POSITIONS } from "@/types/sessions/nightScheduleUtils";

/**
 * Rules a schedule can break. Messages are ready to display; the other fields
 * let the UI jump to the block, activity, person, bunk, or night.
 */
export const SCHEDULE_ISSUE_CODES = [
  "INVALID_SCHEDULE",
  "CAMPER_ACTIVITY_COLLISION",
  "COUNSELOR_ACTIVITY_COLLISION",
  "ASSIGNED_DURING_PERIOD_OFF",
  "CAMPER_MISSING_ACTIVITY",
  "COUNSELOR_UNACCOUNTED",
  "BUNK_ACTIVITY_COLLISION",
  "BUNK_MISSING_ACTIVITY",
  "DUPLICATE_ASSIGNMENT",
  "UNKNOWN_ASSIGNEE",
  "UNKNOWN_BUNK",
  "WRONG_ASSIGNMENT_LIST",
  "NONO_CONFLICT",
  "RELATIONSHIP_SAME_ACTIVITY",
  "RELATIONSHIP_DIFFERENT_PERIOD_OFF",
  "AGE_GROUP_MISMATCH",
  "CAMPER_DISTRIBUTION",
  "STAFF_CAMPER_RATIO",
  "MISSING_ADMIN",
  "DUPLICATE_PROGRAM_AREA",
  "PROGRAM_COUNSELOR_MISSING",
  "PROGRAM_COUNSELOR_UNAVAILABLE",
  "SCHEDULED_ON_DAY_OFF",
  "COUNSELOR_MISSING_PERIOD_OFF",
  "SWIM_COUNT",
  "SWIM_WRONG_BLOCK",
  "SWIM_OPTED_OUT",
  "OCP_CHAT_COUNT",
  "OCP_CHAT_WRONG_BLOCK",
  "EMPTY_ACTIVITY",
  "NIGHT_COLLISION",
  "NIGHT_UNACCOUNTED",
  "NIGHT_SCHEDULED_ON_DAY_OFF",
  "NIGHT_COD_BEFORE_DAY_OFF",
  "NIGHT_UNDERSTAFFED",
  "NIGHT_UNKNOWN_ASSIGNEE",
  "NIGHT_UNKNOWN_BUNK",
] as const;

export const SCHEDULE_ISSUE_SEVERITIES = ["error", "warning"] as const;

const WARNING_ONLY_CODES = new Set<ScheduleIssueCode>([ "RELATIONSHIP_DIFFERENT_PERIOD_OFF", "STAFF_CAMPER_RATIO", "PROGRAM_COUNSELOR_UNAVAILABLE", "COUNSELOR_MISSING_PERIOD_OFF", "EMPTY_ACTIVITY", ]);

const VARIABLE_SEVERITY_CODES = new Set<ScheduleIssueCode>([ "CAMPER_DISTRIBUTION", ]);

export const scheduleIssueSchema = z
  .object({
    code: z.enum(SCHEDULE_ISSUE_CODES),
    severity: z.enum(SCHEDULE_ISSUE_SEVERITIES),
    message: z.string().min(1),
    blockId: z.string().optional(),
    activityId: z.string().optional(),
    activityIds: z.array(z.string()).optional(),
    attendeeId: z.number().int().optional(),
    attendeeIds: z.array(z.number().int()).optional(),
    bunkNum: z.number().int().optional(),
    role: z.enum(["STAFF", "ADMIN"]).optional(),
    date: z.string().optional(),
    position: z.enum(NIGHT_SCHEDULE_POSITIONS).optional(),
    camperCount: z.number().int().nonnegative().optional(),
    counselorCount: z.number().int().nonnegative().optional(),
    programAreaId: z.string().optional(),
    ageGroup: z.enum(AGE_GROUPS).optional(),
    expected: z.number().int().optional(),
    actual: z.number().int().optional(),
    allowedBlockIds: z.array(z.string()).optional(),
  })
  .strict()
  .superRefine((issue, ctx) => {
    if (WARNING_ONLY_CODES.has(issue.code) && issue.severity !== "warning") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${issue.code} is a warning`,
        path: ["severity"],
      });
    }

    if (!WARNING_ONLY_CODES.has(issue.code) && !VARIABLE_SEVERITY_CODES.has(issue.code) && issue.severity !== "error") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${issue.code} is an error`,
        path: ["severity"],
      });
    }
  });

export const scheduleValidationResultSchema = z
  .object({
    issues: z.array(scheduleIssueSchema),
  })
  .transform((result) => ({
    issues: result.issues,
    isValid: result.issues.every((issue) => issue.severity !== "error"),
  }));

export type ScheduleIssueCode = (typeof SCHEDULE_ISSUE_CODES)[number];
export type ScheduleIssueSeverity = (typeof SCHEDULE_ISSUE_SEVERITIES)[number];
export type ScheduleIssue = z.input<typeof scheduleIssueSchema>;
export type ScheduleValidationResult = z.output<typeof scheduleValidationResultSchema>;

export function toScheduleValidationResult(issues: ScheduleIssue[]): ScheduleValidationResult {
  const sorted = [...issues].sort(compareIssues);

  return scheduleValidationResultSchema.parse({ issues: sorted });
}

function compareIssues(a: ScheduleIssue, b: ScheduleIssue): number {
  return [
    a.blockId ?? "",
    a.date ?? "",
    a.bunkNum ?? -1,
    a.activityId ?? "",
    a.code,
    a.attendeeId ?? -1,
    a.message,
  ]
    .join("\u0000")
    .localeCompare([ b.blockId ?? "", b.date ?? "", b.bunkNum ?? -1, b.activityId ?? "", b.code, b.attendeeId ?? -1, b.message, ].join("\u0000"), undefined, { numeric: true });
}
