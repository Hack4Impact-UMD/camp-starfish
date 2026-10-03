import { z } from "zod";
import moment from "moment";

const MAX_NAME_LENGTH = 100;

/**
 * Validates the raw inputs of the Create Session modal before they are
 * converted to Moments and written to the database.
 *
 * `dateRange` matches Mantine's `DatesRangeValue`: a tuple of ISO date
 * strings (or `null` when unselected) emitted by `DatePickerInput`.
 */
export const createSessionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Session name is required")
      .max(MAX_NAME_LENGTH, `Session name must be ${MAX_NAME_LENGTH} characters or fewer`),
    dateRange: z.tuple([
      z.string({ invalid_type_error: "Session dates are required" }).nullable(),
      z.string({ invalid_type_error: "Session dates are required" }).nullable(),
    ]),
  })
  .superRefine((value, ctx) => {
    const [start, end] = value.dateRange;
    if (!start || !end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Session dates are required",
        path: ["dateRange"],
      });
      return;
    }
    if (moment(end).isBefore(moment(start))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after the start date",
        path: ["dateRange"],
      });
    }
  });

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
