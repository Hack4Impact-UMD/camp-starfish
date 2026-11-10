import { getAttendeesById } from "@/features/scheduling/generation/schedulingUtils";
import { sectionScheduleSchema } from "@/features/scheduling/validation/scheduleSchemas";
import { Block, SectionSchedule } from "@/types/scheduling/schedulingTypes";
import {
  Attendee,
  Bunk,
  DaysOffSchedule,
  Section,
} from "@/types/sessions/sessionTypes";
import {
  ScheduleIssue,
  ScheduleIssueCode,
  toScheduleValidationResult,
} from "@/features/scheduling/validation/scheduleIssues";
import {
  dayOffsDuringSection,
  namesOf,
  pairKey,
  relationshipPairs,
} from "@/features/scheduling/validation/validationUtils";
import {
  ACTIVITY_CAMPER_LIMITS,
  MAX_STAFFING_IMBALANCE,
  NAV_SWIM_BLOCK_IDS,
  OCP_CHAT_BLOCK_IDS,
  OCP_CHAT_PROGRAM_AREA_ID,
  OCP_SWIM_BLOCK_IDS,
  SWIM_PROGRAM_AREA_ID,
} from "@/features/scheduling/validation/constants";

export interface ValidateSectionScheduleInput {
  schedule: SectionSchedule;
  attendees: Attendee[];
  bunks: Bunk[];
  section: Section;
  daysOffSchedule: DaysOffSchedule;
  isFirstBundleOfSession: boolean;
}

/** Pure validation: never modifies the schedule or its session data. */
export function validateSectionSchedule(input: ValidateSectionScheduleInput) {
  const { schedule, attendees, bunks, section, daysOffSchedule } = input;
  const issues: ScheduleIssue[] = [];
  const parsed = sectionScheduleSchema.safeParse(input.schedule);

  if (!parsed.success) {
    return toScheduleValidationResult(parsed.error.issues.map((issue) => ({
      code: "INVALID_SCHEDULE" as const,
      severity: "error" as const,
      message: `${issue.path.join(".")}: ${issue.message}`,
    })));
  }

  const people = getAttendeesById(attendees);
  const counselors = attendees.filter((a) => a.role !== "CAMPER");
  const relationships = relationshipPairs(counselors);
  const offSlots = new Map<number, Set<string>>();
  const special = new Map<number, { swim: string[]; chat: string[] }>();
  const add = (code: ScheduleIssueCode, message: string, details: Partial<ScheduleIssue> = {}, severity: ScheduleIssue["severity"] = "error") => issues.push({ code, severity, message, ...details });
  const name = (id: number) => namesOf(people, [id]);
  const hasDayOff = new Set(counselors
    .filter((person) => dayOffsDuringSection(person.attendeeId, daysOffSchedule, section).length > 0)
    .map((person) => person.attendeeId));

  function readOff(ids: number[], slot: string, blockId?: string) {
    const seen = new Set<number>();

    for (const id of ids) {
      if (seen.has(id)) {
        add("DUPLICATE_ASSIGNMENT", `${name(id)} is listed twice for period off ${slot}.`, { attendeeId: id, blockId });
      }

      seen.add(id);

      if (!people[id]) {
        add("UNKNOWN_ASSIGNEE", `Unknown person ${id} in period off ${slot}.`, {
          attendeeId: id,
          blockId,
        });
      } else if (people[id].role === "CAMPER") {
        add("WRONG_ASSIGNMENT_LIST", `${name(id)} is a camper in a counselor period-off list.`, { attendeeId: id, blockId });
      }

      const slots = offSlots.get(id) ?? new Set<string>();

      slots.add(slot);
      offSlots.set(id, slots);
    }
  }

  for (const [id, ids] of Object.entries(schedule.alternatePeriodsOff)) {
    readOff(ids, `alternate:${id}`);
  }

  for (const [id, block] of Object.entries<Block>(schedule.blocks)) {
    readOff(block.periodsOff, `block:${id}`, id);
  }

  for (const [blockId, block] of Object.entries<Block>(schedule.blocks)) {
    const availability = (id: number) => ({
      periodOff: block.periodsOff.includes(id),
      dayOff: hasDayOff.has(id),
    });
    const placements = new Map<number, string[]>();
    const bunkPlacements = new Map<number, string[]>();
    const areas = new Set<string>();

    for (const [activityId, activity] of Object.entries(block.activities)) {
      const context = { blockId, activityId };
      const assigned = new Set<number>();

      function assign(ids: number[], role: Attendee["role"], implicit = false) {
        const seen = new Set<number>();

        for (const id of ids) {
          if (seen.has(id)) {
            add("DUPLICATE_ASSIGNMENT", `${name(id)} is repeated in ${activity.name}.`, { ...context, attendeeId: id });
          }

          seen.add(id);

          const person = people[id];

          if (!person) {
            add("UNKNOWN_ASSIGNEE", `Unknown person ${id} in ${activity.name}.`, { ...context, attendeeId: id });
            continue;
          }

          if (person.role !== role) {
            add("WRONG_ASSIGNMENT_LIST", `${name(id)} belongs in the ${person.role} list.`, { ...context, attendeeId: id });
            continue;
          }

          const { periodOff, dayOff } = availability(id);

          // Bunk staff remain with their bunk unless they have this period off.
          if (implicit && role !== "CAMPER" && periodOff) {
            continue;
          }

          if (assigned.has(id)) {
            continue;
          }

          assigned.add(id);

          const slots = placements.get(id) ?? [];

          slots.push(activityId);
          placements.set(id, slots);

          if (role !== "CAMPER" && periodOff) {
            add("ASSIGNED_DURING_PERIOD_OFF", `${name(id)} is assigned during their period off.`, { ...context, attendeeId: id });
          }

          if (role !== "CAMPER" && dayOff) {
            add("SCHEDULED_ON_DAY_OFF", `${name(id)} has a day off during this section but is assigned to ${activity.name}.`, { ...context, attendeeId: id });
          }
        }
      }

      if ("bunkNums" in activity) {
        const seen = new Set<number>();

        for (const num of activity.bunkNums) {
          if (seen.has(num)) {
            add("DUPLICATE_ASSIGNMENT", `Bunk ${num} is repeated in ${activity.name}.`, { ...context, bunkNum: num });
            continue;
          }

          seen.add(num);

          const bunk = bunks.find((b) => b.bunkNum === num);

          if (!bunk) {
            add("UNKNOWN_BUNK", `Unknown bunk ${num}.`, {
              ...context,
              bunkNum: num,
            });
            continue;
          }

          bunkPlacements.set(num, [ ...(bunkPlacements.get(num) ?? []), activityId, ]);
          assign(bunk.camperIds, "CAMPER", true);
          assign(bunk.counselorIds, "STAFF", true);
        }
      } else {
        assign(activity.camperIds, "CAMPER");
        assign(activity.staffIds, "STAFF");
      }

      assign(activity.adminIds, "ADMIN");

      const members = [...assigned].map((id) => people[id]);
      const campers = members.filter((a) => a.role === "CAMPER");
      const staff = members.filter((a) => a.role === "STAFF");
      const admins = members.filter((a) => a.role === "ADMIN");

      if (!campers.length) {
        add("EMPTY_ACTIVITY", `${activity.name} has no campers.`, context, "warning");
      }

      if (!admins.length) {
        add("MISSING_ADMIN", `${activity.name} has no administrator.`, context);
      }

      if (Math.abs(staff.length - campers.length) > MAX_STAFFING_IMBALANCE) {
        add("STAFF_CAMPER_RATIO", `${activity.name} has ${staff.length} staff for ${campers.length} campers.`, {
          ...context,
          camperCount: campers.length,
          counselorCount: staff.length,
        }, "warning");
      }

      const conflicts = new Set<string>();

      for (const person of members) {
        for (const other of person.snapshot.nonoList) {
          const key = pairKey(person.attendeeId, other);

          if (other !== person.attendeeId && assigned.has(other) && !conflicts.has(key)) {
            conflicts.add(key);
            add("NONO_CONFLICT", `${name(person.attendeeId)} and ${name(other)} cannot share an activity.`, { ...context, attendeeIds: [person.attendeeId, other] });
          }
        }
      }

      for (const pair of relationships) {
        if (pair.every((id) => assigned.has(id))) {
          add("RELATIONSHIP_SAME_ACTIVITY", `${namesOf(people, pair)} are in a relationship and share an activity.`, { ...context, attendeeIds: pair });
        }
      }

      if ("programAreaId" in activity) {
        const area = activity.programAreaId;

        if (areas.has(area)) {
          add("DUPLICATE_PROGRAM_AREA", `Program area ${area} appears more than once in block ${blockId}.`, { ...context, programAreaId: area });
        }

        areas.add(area);

        const isSpecial = area === SWIM_PROGRAM_AREA_ID || area === OCP_CHAT_PROGRAM_AREA_ID;

        if (!isSpecial) {
          const n = campers.length;

          if (n < ACTIVITY_CAMPER_LIMITS.idealMin || n > ACTIVITY_CAMPER_LIMITS.idealMax) {
            add("CAMPER_DISTRIBUTION", `${activity.name} has ${n} campers; required 4–9, ideally 5–8.`, { ...context, camperCount: n }, n < ACTIVITY_CAMPER_LIMITS.min || n > ACTIVITY_CAMPER_LIMITS.max ? "error" : "warning");
          }
        }

        for (const camper of campers) {
          if (camper.ageGroup !== activity.ageGroup || (area === OCP_CHAT_PROGRAM_AREA_ID && camper.ageGroup !== "OCP")) {
            add("AGE_GROUP_MISMATCH", `${name(camper.attendeeId)} does not match the activity age group.`, { ...context, attendeeId: camper.attendeeId });
          }

          const counts = special.get(camper.attendeeId) ?? {
            swim: [],
            chat: [],
          };

          if (area === SWIM_PROGRAM_AREA_ID) {
            counts.swim.push(blockId);
          }

          if (area === OCP_CHAT_PROGRAM_AREA_ID) {
            counts.chat.push(blockId);
          }

          special.set(camper.attendeeId, counts);
        }

        for (const counselor of counselors) {
          if (counselor.role === "STAFF" && counselor.programCounselorFor === area && !assigned.has(counselor.attendeeId)) {
            const unavailable = availability(counselor.attendeeId).periodOff;

            add(unavailable ? "PROGRAM_COUNSELOR_UNAVAILABLE" : "PROGRAM_COUNSELOR_MISSING", `${name(counselor.attendeeId)} is the program counselor for ${area} but is absent.`, {
              ...context,
              attendeeId: counselor.attendeeId,
              programAreaId: area,
            }, unavailable ? "warning" : "error");
          }
        }
      }
    }

    for (const person of attendees) {
      const slots = placements.get(person.attendeeId) ?? [];
      const context = { blockId, attendeeId: person.attendeeId };

      if (slots.length > 1) {
        add(person.role === "CAMPER" ? "CAMPER_ACTIVITY_COLLISION" : "COUNSELOR_ACTIVITY_COLLISION", `${name(person.attendeeId)} is assigned to multiple activities.`, { ...context, activityIds: slots });
      }

      if (!slots.length && person.role === "CAMPER") {
        add("CAMPER_MISSING_ACTIVITY", `${name(person.attendeeId)} has no activity.`, context);
      }

      if (!slots.length && person.role !== "CAMPER" && !availability(person.attendeeId).periodOff) {
        add("COUNSELOR_UNACCOUNTED", `${name(person.attendeeId)} has no activity or period off.`, { ...context, role: person.role });
      }
    }

    if (schedule.type === "BUNK-JAMBO") {
      for (const bunk of bunks) {
        const slots = bunkPlacements.get(bunk.bunkNum) ?? [];

        if (!slots.length) {
          add("BUNK_MISSING_ACTIVITY", `Bunk ${bunk.bunkNum} has no activity.`, { blockId, bunkNum: bunk.bunkNum });
        }

        if (slots.length > 1) {
          add("BUNK_ACTIVITY_COLLISION", `Bunk ${bunk.bunkNum} has multiple activities.`, { blockId, bunkNum: bunk.bunkNum, activityIds: slots });
        }
      }
    }
  }

  for (const counselor of counselors) {
    if (!offSlots.get(counselor.attendeeId)?.size) {
      add("COUNSELOR_MISSING_PERIOD_OFF", `${name(counselor.attendeeId)} has no period off.`, { attendeeId: counselor.attendeeId }, "warning");
    }
  }

  for (const pair of relationships) {
    const a = offSlots.get(pair[0]);
    const b = offSlots.get(pair[1]);

    if (!a || !b || a.size !== b.size || [...a].some((slot) => !b.has(slot))) {
      add("RELATIONSHIP_DIFFERENT_PERIOD_OFF", `${namesOf(people, pair)} should ideally have the same periods off.`, { attendeeIds: pair }, "warning");
    }
  }

  if (schedule.type === "BUNDLE") {
    for (const camper of attendees.filter((a) => a.role === "CAMPER")) {
      const counts = special.get(camper.attendeeId) ?? { swim: [], chat: [] };
      const optedOut = camper.ageGroup === "OCP" && !input.isFirstBundleOfSession && camper.level >= 4 && camper.isOptedOutFromSwim;
      const expected = optedOut ? 0 : 1;
      const context = { attendeeId: camper.attendeeId };

      if (counts.swim.length !== expected) {
        add(optedOut && counts.swim.length ? "SWIM_OPTED_OUT" : "SWIM_COUNT", `${name(camper.attendeeId)} needs ${expected} swim block(s), has ${counts.swim.length}.`, { ...context, expected, actual: counts.swim.length });
      }

      const allowed: readonly string[] = camper.ageGroup === "NAV" ? NAV_SWIM_BLOCK_IDS : OCP_SWIM_BLOCK_IDS;

      for (const blockId of counts.swim) {
        if (!allowed.includes(blockId)) {
          add("SWIM_WRONG_BLOCK", `${name(camper.attendeeId)} swims outside the allowed blocks.`, { ...context, blockId, allowedBlockIds: [...allowed] });
        }
      }

      if (camper.ageGroup === "OCP") {
        if (counts.chat.length !== 1) {
          add("OCP_CHAT_COUNT", `${name(camper.attendeeId)} needs exactly one OCP chat.`, { ...context, expected: 1, actual: counts.chat.length });
        }

        for (const blockId of counts.chat) {
          if (!(OCP_CHAT_BLOCK_IDS as readonly string[]).includes(blockId)) {
            add("OCP_CHAT_WRONG_BLOCK", `${name(camper.attendeeId)} has OCP chat outside C–E.`, { ...context, blockId, allowedBlockIds: [...OCP_CHAT_BLOCK_IDS] });
          }
        }
      }
    }
  }

  return toScheduleValidationResult(issues);
}
