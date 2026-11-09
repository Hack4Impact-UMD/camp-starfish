import { nightScheduleSchema } from "./scheduleSchemas";
import { getAttendeeName } from "@/features/scheduling/generation/schedulingUtils";
import { NIGHT_SCHEDULE_POSITIONS } from "@/types/sessions/nightScheduleUtils";
import {
  Attendee,
  Bunk,
  DaysOffSchedule,
  NightSchedule,
  NightSchedulePosition,
} from "@/types/sessions/sessionTypes";
import { isStaffAttendee } from "@/types/sessions/sessionTypeGuards";
import { toRecord } from "@/utils/data/toRecord";
import { MIN_COUNSELORS_ON_DUTY, MIN_NIGHT_BUNK_DUTY } from "./constants";
import {
  ScheduleIssue,
  toScheduleValidationResult,
  ScheduleValidationResult,
} from "./scheduleIssues";
import { isCounselorOffOnDate } from "./validationUtils";

export interface ValidateNightScheduleInput {
  nightSchedule: NightSchedule;
  attendees: Attendee[];
  bunks: Bunk[];
  daysOffSchedule: DaysOffSchedule;
}

const POSITION_MINIMUMS: Partial<Record<NightSchedulePosition, number>> = {
  "COUNSELOR-ON-DUTY": MIN_COUNSELORS_ON_DUTY,
  "NIGHT-BUNK-DUTY": MIN_NIGHT_BUNK_DUTY,
};

interface NightSlot {
  bunkNum: number;
  position: NightSchedulePosition;
}

/**
 * Checks one night: nobody is in two jobs, people on a day off are not working,
 * counselor-on-duty is not the night before that person's day off, every staff
 * member is either off or in exactly one role, and each bunk has enough
 * counselor-on-duty and night-bunk-duty coverage.
 */
export function validateNightSchedule(input: ValidateNightScheduleInput): ScheduleValidationResult {
  const { nightSchedule, daysOffSchedule } = input;
  const issues: ScheduleIssue[] = [];
  const parsed = nightScheduleSchema.safeParse(input.nightSchedule);

  if (!parsed.success) {
    return toScheduleValidationResult(parsed.error.issues.map((issue) => ({
      code: "INVALID_SCHEDULE" as const,
      severity: "error" as const,
      message: `${issue.path.join(".")}: ${issue.message}`,
    })));
  }

  const attendeesById = toRecord(input.attendees, (attendee) => attendee.attendeeId);
  const bunksByNum = toRecord(input.bunks, (bunk) => bunk.bunkNum);
  const date = nightSchedule.date;
  const dateLabel = date.format("YYYY-MM-DD");
  const slotsByAttendee = new Map<number, NightSlot[]>();

  const bunkNums = new Set<number>([ ...input.bunks.map((bunk) => bunk.bunkNum), ...Object.keys(nightSchedule.bunks).map(Number), ]);

  for (const bunkNum of [...bunkNums].sort((a, b) => a - b)) {
    const assignments = nightSchedule.bunks[bunkNum];

    if (!bunksByNum[bunkNum]) {
      issues.push({
        code: "NIGHT_UNKNOWN_BUNK",
        severity: "error",
        message: `Night schedule for ${dateLabel} assigns bunk ${bunkNum}, which is not a bunk in this session.`,
        date: dateLabel,
        bunkNum,
      });
    }

    if (!assignments) {
      reportNightUnderstaffing(issues, dateLabel, bunkNum, {});
      continue;
    }

    const assignedByPosition: Partial<Record<NightSchedulePosition, Set<number>>> = {};

    for (const position of NIGHT_SCHEDULE_POSITIONS) {
      const seen = new Set<number>();

      assignedByPosition[position] = seen;

      for (const attendeeId of assignments[position] ?? []) {
        const slot = { bunkNum, position };

        if (!attendeesById[attendeeId]) {
          issues.push({
            code: "NIGHT_UNKNOWN_ASSIGNEE",
            severity: "error",
            message: `Bunk ${bunkNum} lists unknown person ${attendeeId} as ${positionLabel(position)} on ${dateLabel}.`,
            date: dateLabel,
            bunkNum,
            position,
            attendeeId,
          });
          continue;
        }

        if (attendeesById[attendeeId].role === "CAMPER") {
          issues.push({
            code: "WRONG_ASSIGNMENT_LIST",
            severity: "error",
            message: `${getAttendeeName(attendeesById, attendeeId)} is a camper and cannot fill a night role.`,
            date: dateLabel,
            bunkNum,
            position,
            attendeeId,
          });
          continue;
        }

        if (seen.has(attendeeId)) {
          issues.push({
            code: "DUPLICATE_ASSIGNMENT",
            severity: "error",
            message: `${getAttendeeName(attendeesById, attendeeId)} is listed more than once as ${positionLabel(position)} for bunk ${bunkNum} on ${dateLabel}.`,
            date: dateLabel,
            bunkNum,
            position,
            attendeeId,
          });
          continue;
        }

        seen.add(attendeeId);

        const slots = slotsByAttendee.get(attendeeId) ?? [];

        slots.push(slot);
        slotsByAttendee.set(attendeeId, slots);
      }
    }

    const availableByPosition = Object.fromEntries(NIGHT_SCHEDULE_POSITIONS.map((position) => [ position, new Set([...(assignedByPosition[position] ?? [])].filter((id) => !isCounselorOffOnDate(id, date, daysOffSchedule))), ]));

    reportNightUnderstaffing(issues, dateLabel, bunkNum, availableByPosition);
  }

  for (const [attendeeId, slots] of slotsByAttendee) {
    const name = getAttendeeName(attendeesById, attendeeId);

    if (slots.length > 1) {
      const places = slots.map((slot) => `${positionLabel(slot.position)} at bunk ${slot.bunkNum}`).join(", ");

      issues.push({
        code: "NIGHT_COLLISION",
        severity: "error",
        message: `${name} is scheduled in more than one night role on ${dateLabel}: ${places}.`,
        date: dateLabel,
        attendeeId,
      });
    }

    if (isCounselorOffOnDate(attendeeId, date, daysOffSchedule)) {
      for (const slot of slots) {
        issues.push({
          code: "NIGHT_SCHEDULED_ON_DAY_OFF",
          severity: "error",
          message: `${name} is ${positionLabel(slot.position)} for bunk ${slot.bunkNum} on ${dateLabel}, which is their day off.`,
          date: dateLabel,
          bunkNum: slot.bunkNum,
          position: slot.position,
          attendeeId,
        });
      }
    }

    const tomorrow = date.clone().add(1, "day");
    const isCod = slots.some((slot) => slot.position === "COUNSELOR-ON-DUTY");

    if (isCod && isCounselorOffOnDate(attendeeId, tomorrow, daysOffSchedule)) {
      issues.push({
        code: "NIGHT_COD_BEFORE_DAY_OFF",
        severity: "error",
        message: `${name} is counselor on duty on ${dateLabel}, the night before their day off.`,
        date: dateLabel,
        attendeeId,
        position: "COUNSELOR-ON-DUTY",
      });
    }
  }

  for (const attendee of input.attendees) {
    if (!isStaffAttendee(attendee) || isCounselorOffOnDate(attendee.attendeeId, date, daysOffSchedule)) {
      continue;
    }

    if ((slotsByAttendee.get(attendee.attendeeId) ?? []).length > 0) {
      continue;
    }

    const homeBunk = input.bunks.find((bunk) => bunk.counselorIds.includes(attendee.attendeeId));

    issues.push({
      code: "NIGHT_UNACCOUNTED",
      severity: "error",
      message: `${getAttendeeName(attendeesById, attendee.attendeeId)} is not on a day off and has no night role on ${dateLabel}.`,
      date: dateLabel,
      attendeeId: attendee.attendeeId,
      bunkNum: homeBunk?.bunkNum,
      role: "STAFF",
    });
  }

  return toScheduleValidationResult(issues);
}

function reportNightUnderstaffing(issues: ScheduleIssue[], dateLabel: string, bunkNum: number, assignedByPosition: Partial<Record<NightSchedulePosition, Set<number>>>) {
  for (const position of NIGHT_SCHEDULE_POSITIONS) {
    const minimum = POSITION_MINIMUMS[position];

    if (minimum === undefined) {
      continue;
    }

    const actual = assignedByPosition[position]?.size ?? 0;

    if (actual >= minimum) {
      continue;
    }

    issues.push({
      code: "NIGHT_UNDERSTAFFED",
      severity: "error",
      message: `Bunk ${bunkNum} has ${actual} ${positionLabel(position)} assignment${actual === 1 ? "" : "s"} on ${dateLabel}. At least ${minimum} are required.`,
      date: dateLabel,
      bunkNum,
      position,
      expected: minimum,
      actual,
    });
  }
}

function positionLabel(position: NightSchedulePosition): string {
  switch (position) {
    case "COUNSELOR-ON-DUTY":
      return "counselor on duty";
    case "NIGHT-BUNK-DUTY":
      return "night bunk duty";
    case "ROVER":
      return "rover";
  }
}
