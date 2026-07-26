import { describe, it, expect } from "vitest";
import moment from "moment";
import generateBundleSchedule from "./generateBundleSchedule";
import {
  AdminAttendee,
  Attendee,
  CamperAttendee,
  DaysOffSchedule,
  SchedulingSection,
  StaffAttendee,
} from "@/types/sessions/sessionTypes";
import {
  BundleActivityWithAssignments,
  BundleSectionSchedule,
  SectionActivityPreferences,
} from "@/types/scheduling/schedulingTypes";

const SESSION_ID = "session-1";
const SECTION_ID = "section-1";

function makeCamper(id: number, overrides: Partial<CamperAttendee> = {}): CamperAttendee {
  return {
    attendeeId: id,
    sessionId: SESSION_ID,
    role: "CAMPER",
    snapshot: {
      name: { firstName: `Camper${id}`, lastName: "Test" },
      gender: "Other",
      dateOfBirth: moment("2015-06-01"),
      nonoList: [],
    },
    ageGroup: "OCP",
    level: 3,
    bunk: 1,
    isOptedOutFromSwim: false,
    ...overrides,
  };
}

function makeStaff(id: number, overrides: Partial<StaffAttendee> = {}): StaffAttendee {
  return {
    attendeeId: id,
    sessionId: SESSION_ID,
    role: "STAFF",
    snapshot: {
      name: { firstName: `Staff${id}`, lastName: "Test" },
      gender: "Other",
      dateOfBirth: moment("1998-06-01"),
      nonoList: [],
      yesyesList: [],
    },
    bunk: 1,
    isLeadBunkCounselor: false,
    ...overrides,
  };
}

function makeAdmin(id: number): AdminAttendee {
  return {
    attendeeId: id,
    sessionId: SESSION_ID,
    role: "ADMIN",
    snapshot: {
      name: { firstName: `Admin${id}`, lastName: "Test" },
      gender: "Other",
      dateOfBirth: moment("1990-06-01"),
      nonoList: [],
      yesyesList: [],
    },
  };
}

function makeActivity(
  id: string,
  programAreaId: string,
  ageGroup: "OCP" | "NAV" = "OCP",
): BundleActivityWithAssignments {
  return {
    id,
    name: `Activity ${id}`,
    description: "",
    programAreaId,
    ageGroup,
    camperIds: [],
    staffIds: [],
    adminIds: [],
  };
}

// Block ids are UPPERCASE to match getBlockIdFromNum / getEmptySectionScheduleDoc.
function makeSchedule(blocks: {
  [blockId: string]: BundleActivityWithAssignments[];
}): BundleSectionSchedule {
  return {
    sessionId: SESSION_ID,
    sectionId: SECTION_ID,
    type: "BUNDLE",
    blocks: Object.fromEntries(
      Object.entries(blocks).map(([id, activities]) => [
        id,
        { activities, periodsOff: [] },
      ]),
    ),
    alternatePeriodsOff: { "1": [] },
  };
}

function makeSection(): SchedulingSection {
  return {
    id: SECTION_ID,
    sessionId: SESSION_ID,
    name: "Bundle 1",
    type: "BUNDLE",
    startDate: moment("2026-07-06"),
    endDate: moment("2026-07-10"),
  };
}

function makeDaysOff(byId: Record<number, string[]> = {}): DaysOffSchedule {
  return {
    sessionId: SESSION_ID,
    daysOffInSession: [],
    daysOffByCounselorId: Object.fromEntries(
      Object.entries(byId).map(([id, days]) => [id, days.map((d) => moment(d))]),
    ),
  };
}

// Prefs are keyed blockId -> camperId -> programAreaId -> rank (lower = preferred).
function makePrefs(
  blockIds: string[],
  camperIds: number[],
  programAreaIds: string[],
): SectionActivityPreferences {
  return {
    blocks: Object.fromEntries(
      blockIds.map((blockId) => [
        blockId,
        Object.fromEntries(
          camperIds.map((camperId) => [
            camperId,
            Object.fromEntries(programAreaIds.map((area, i) => [area, i + 1])),
          ]),
        ),
      ]),
    ),
  };
}

function camperAssignmentCounts(
  schedule: BundleSectionSchedule,
  camperIds: number[],
): Record<string, Record<number, number>> {
  const counts: Record<string, Record<number, number>> = {};
  for (const [blockId, block] of Object.entries(schedule.blocks)) {
    counts[blockId] = Object.fromEntries(camperIds.map((id) => [id, 0]));
    for (const activity of block.activities) {
      for (const camperId of activity.camperIds) {
        counts[blockId][camperId] += 1;
      }
    }
  }
  return counts;
}

describe("generateBundleSchedule", () => {
  it("assigns every camper to exactly one activity per block and preserves the activity layout", () => {
    const campers = [1, 2, 3, 4].map((id) => makeCamper(id));
    const staff = [
      makeStaff(11, { programCounselorFor: "ARTS" }),
      makeStaff(12, { programCounselorFor: "SPORTS" }),
    ];
    const admins = [makeAdmin(21)];
    const attendees: Attendee[] = [...campers, ...staff, ...admins];

    const currentSchedule = makeSchedule({
      A: [makeActivity("a1", "ARTS"), makeActivity("a2", "SPORTS")],
      B: [makeActivity("b1", "ARTS"), makeActivity("b2", "SPORTS")],
    });

    const result = generateBundleSchedule({
      attendees,
      camperActivityPreferences: makePrefs(["A", "B"], [1, 2, 3, 4], ["ARTS", "SPORTS"]),
      currentSchedule,
      daysOffSchedule: makeDaysOff({ 11: [], 12: [] }),
      section: makeSection(),
      isFirstBundleOfSession: false,
    });

    expect(result.type).toBe("BUNDLE");
    expect(Object.keys(result.blocks).sort()).toEqual(["A", "B"]);

    // Activity layout preserved (ids in order), assignments regenerated.
    expect(result.blocks["A"].activities.map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(result.blocks["B"].activities.map((a) => a.id)).toEqual(["b1", "b2"]);

    // Every camper in exactly one activity per block.
    const counts = camperAssignmentCounts(result, [1, 2, 3, 4]);
    for (const blockId of ["A", "B"]) {
      for (const camperId of [1, 2, 3, 4]) {
        expect(counts[blockId][camperId]).toBe(1);
      }
    }

    // Program counselors are attached to their program area's activity in every block.
    for (const blockId of ["A", "B"]) {
      const arts = result.blocks[blockId].activities.find((a) => a.programAreaId === "ARTS")!;
      const sports = result.blocks[blockId].activities.find((a) => a.programAreaId === "SPORTS")!;
      expect(arts.adminIds).toContain(11);
      expect(sports.adminIds).toContain(12);
    }

    // Every counselor not on a period off in a block is assigned somewhere in it.
    for (const block of Object.values(result.blocks)) {
      for (const counselorId of [11, 12, 21]) {
        if (block.periodsOff.includes(counselorId)) continue;
        const assigned = block.activities.some(
          (a) => a.staffIds.includes(counselorId) || a.adminIds.includes(counselorId),
        );
        expect(assigned).toBe(true);
      }
    }
  });

  it("does not throw when there are no program counselors at all", () => {
    const attendees: Attendee[] = [makeCamper(1), makeCamper(2), makeStaff(11)];
    const currentSchedule = makeSchedule({
      A: [makeActivity("a1", "ARTS"), makeActivity("a2", "SPORTS")],
    });

    const result = generateBundleSchedule({
      attendees,
      camperActivityPreferences: makePrefs(["A"], [1, 2], ["ARTS", "SPORTS"]),
      currentSchedule,
      daysOffSchedule: makeDaysOff(),
      section: makeSection(),
      isFirstBundleOfSession: false,
    });

    const counts = camperAssignmentCounts(result, [1, 2]);
    expect(counts["A"][1]).toBe(1);
    expect(counts["A"][2]).toBe(1);
  });

  it("does not throw when a program counselor has no days-off entry, and still assigns them", () => {
    const attendees: Attendee[] = [
      makeCamper(1),
      makeStaff(11, { programCounselorFor: "ARTS" }),
    ];
    const currentSchedule = makeSchedule({
      A: [makeActivity("a1", "ARTS")],
    });

    const result = generateBundleSchedule({
      attendees,
      camperActivityPreferences: makePrefs(["A"], [1], ["ARTS"]),
      currentSchedule,
      // Deliberately no entry for counselor 11.
      daysOffSchedule: makeDaysOff(),
      section: makeSection(),
      isFirstBundleOfSession: false,
    });

    expect(result.blocks["A"].activities[0].adminIds).toContain(11);
  });

  it("does not throw when a camper is missing from the preferences doc", () => {
    const attendees: Attendee[] = [makeCamper(1), makeCamper(2)];
    const currentSchedule = makeSchedule({
      A: [makeActivity("a1", "ARTS"), makeActivity("a2", "SPORTS")],
    });

    const result = generateBundleSchedule({
      attendees,
      // Prefs only cover camper 1; camper 2 has no entry.
      camperActivityPreferences: makePrefs(["A"], [1], ["ARTS", "SPORTS"]),
      currentSchedule,
      daysOffSchedule: makeDaysOff(),
      section: makeSection(),
      isFirstBundleOfSession: false,
    });

    const counts = camperAssignmentCounts(result, [1, 2]);
    expect(counts["A"][1]).toBe(1);
    expect(counts["A"][2]).toBe(1);
  });

  it("caps OCP swim activities by the OCP swim activity count, not the NAV count", () => {
    const campers = [1, 2, 3, 4, 5, 6].map((id) => makeCamper(id, { ageGroup: "OCP" }));
    const attendees: Attendee[] = [...campers];

    // Two OCP swim (WF) activities, zero NAV swim activities. Pre-fix, the cap
    // divided by the NAV count (0 -> Infinity), letting one activity absorb everyone.
    const currentSchedule = makeSchedule({
      A: [makeActivity("swim-a", "WF", "OCP"), makeActivity("arts-a", "ARTS")],
      B: [makeActivity("swim-b", "WF", "OCP"), makeActivity("arts-b", "ARTS")],
    });

    const result = generateBundleSchedule({
      attendees,
      // ARTS ranked first so the general assignment loop's preference-sorted
      // fallback tops up ARTS, not swim — isolating the swim loop's cap.
      camperActivityPreferences: makePrefs(["A", "B"], [1, 2, 3, 4, 5, 6], ["ARTS", "WF"]),
      currentSchedule,
      daysOffSchedule: makeDaysOff(),
      section: makeSection(),
      isFirstBundleOfSession: true,
    });

    const cap = Math.ceil(6 / 2); // 3
    let totalSwimAssignments = 0;
    for (const blockId of ["A", "B"]) {
      const swim = result.blocks[blockId].activities.find((a) => a.programAreaId === "WF")!;
      expect(swim.camperIds.length).toBeLessThanOrEqual(cap);
      totalSwimAssignments += swim.camperIds.length;
    }
    // Every OCP camper gets exactly one swim slot in the first bundle.
    expect(totalSwimAssignments).toBe(6);
  });
});
