/**
 * Seed section-schedule test data into the Firebase emulators.
 *
 * The saved emulator export (test/emulatorData) contains sessions, sections,
 * attendees, and bunks — but NO section-schedule docs, no programAreas, and its
 * freeplay docs use IDs like "freeplay-1" while the app reads "YYYY-MM-DD" doc
 * IDs. Without this data every section page says "No schedule has been
 * generated yet" and the EXPORT (PDF) button errors. This script fills those
 * gaps with realistic data built from the attendees/bunks already in the
 * export (session1: campers = attendeeIds 1-50, staff = 51-100,
 * admins = 101-120, bunks 1-10).
 *
 * USAGE
 *   1. Start the emulators with the seed import (in one terminal):
 *        firebase emulators:start --only auth,firestore,storage --import=./test/emulatorData
 *   2. Run this script:
 *        npx tsx scripts/seed-test-schedules.ts
 *   3. Start the app (npm run dev), sign in via "Sign in with Google" and pick
 *      the "Olive Otter" test account (ADMIN), then visit:
 *        http://localhost:3000/sessions/session1/afd7de69-90e8-46ad-ae0f-240ef900d6b0   (BUNDLE "Bundle 1")
 *        http://localhost:3000/sessions/session1/47ec4c5b-6377-48a6-82a8-8b490a7a099d   (BUNK-JAMBO "Jamboree Day 1")
 *        http://localhost:3000/sessions/session1/test-nonbunk                           (NON-BUNK-JAMBO, created by this script)
 *
 * WHAT IT WRITES
 *   - Schedule docs (sessions/{id}/sections/{id}/schedule/schedule) for the
 *     three sections above. Blocks A and B have activities with real
 *     assignments; block C is left empty to exercise the "No activities
 *     scheduled" placeholder.
 *   - A "Non-Bunk Jamboree Test" section (session1 has no NON-BUNK-JAMBO section).
 *   - One deliberately nonexistent camperId (999) in a non-bunk activity to
 *     exercise the stale-ID "#999" fallback rendering.
 *   - Freeplay docs keyed by each section's start date in LOCAL time (the PDF
 *     export looks them up by section.startDate formatted locally).
 *   - The programAreas docs referenced by the bundle schedule (the bundle PDF
 *     export fetches them).
 *
 * NOTES
 *   - Writes go through firebase-admin pointed at the Firestore emulator
 *     (FIRESTORE_EMULATOR_HOST, defaulting to localhost:8080), which bypasses
 *     security rules; nothing here touches production, and nothing is
 *     persisted to test/emulatorData (the emulator only saves state if
 *     started with --export-on-exit).
 *   - Re-runnable: every write is an upsert, so run it again after any
 *     emulator restart.
 *   - Document shapes are typed against src/data/firestore/types/documents.ts,
 *     so schema drift fails `npm run compile` instead of seeding broken data.
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type { Timestamp as ClientTimestamp } from "firebase/firestore";
import moment from "moment";
import type {
  FreeplayDoc,
  ProgramAreaDoc,
  SchedulingSectionDoc,
  SectionScheduleDoc,
} from "@/data/firestore/types/documents";

// The doc types use the client SDK's Timestamp; admin writes use the admin
// SDK's. They are structurally interchangeable on the wire but not in TS.
type AdminValue<V> = V extends ClientTimestamp ? Timestamp : V;
type AdminDoc<T> = { [K in keyof T]: AdminValue<T[K]> };

const SESSION_ID = "session1";
const BUNDLE_SECTION_ID = "afd7de69-90e8-46ad-ae0f-240ef900d6b0"; // "Bundle 1"
const BUNK_JAMBO_SECTION_ID = "47ec4c5b-6377-48a6-82a8-8b490a7a099d"; // "Jamboree Day 1"
const NON_BUNK_SECTION_ID = "test-nonbunk"; // created below

// Section start timestamps (04:00Z == midnight US/Eastern, matching the
// emulator export). The first two mirror the imported section docs.
const SECTION_START_DATES: Record<string, string> = {
  [BUNDLE_SECTION_ID]: "2026-05-21T04:00:00Z",
  [BUNK_JAMBO_SECTION_ID]: "2026-05-24T04:00:00Z",
  [NON_BUNK_SECTION_ID]: "2026-05-26T04:00:00Z",
};

const NON_BUNK_SECTION: AdminDoc<SchedulingSectionDoc> = {
  name: "Non-Bunk Jamboree Test",
  type: "NON-BUNK-JAMBO",
  startDate: Timestamp.fromDate(new Date(SECTION_START_DATES[NON_BUNK_SECTION_ID])),
  endDate: Timestamp.fromDate(new Date("2026-05-27T03:59:59.999Z")),
  publishedAt: null,
};

// Block C intentionally empty in every schedule to exercise the
// "No activities scheduled" placeholder.
const BUNDLE_SCHEDULE: SectionScheduleDoc = {
  type: "BUNDLE",
  blocks: {
    A: {
      activities: [
        { id: "act-b1", name: "Pottery", description: "Make clay pots", programAreaId: "A&C", ageGroup: "NAV", camperIds: [1, 11, 21], staffIds: [51, 61], adminIds: [101] },
        { id: "act-b2", name: "Soccer", description: "Play soccer", programAreaId: "ATH", ageGroup: "OCP", camperIds: [2, 12], staffIds: [52], adminIds: [] },
      ],
      periodsOff: [53],
    },
    B: {
      activities: [
        { id: "act-b3", name: "Kayaking", description: "Lake kayaking", programAreaId: "BOAT", ageGroup: "NAV", camperIds: [3, 13, 23], staffIds: [54, 55], adminIds: [102] },
      ],
      periodsOff: [],
    },
    C: { activities: [], periodsOff: [] },
  },
  alternatePeriodsOff: {},
};

// Assignments are bunk numbers, not individuals.
const BUNK_JAMBO_SCHEDULE: SectionScheduleDoc = {
  type: "BUNK-JAMBO",
  blocks: {
    A: {
      activities: [
        { id: "act-j1", name: "Field Games", description: "Big field games", bunkNums: [1, 2], adminIds: [101] },
        { id: "act-j2", name: "Talent Show Prep", description: "Prep skits", bunkNums: [3], adminIds: [] },
      ],
      periodsOff: [],
    },
    B: {
      activities: [
        { id: "act-j3", name: "Scavenger Hunt", description: "Camp-wide hunt", bunkNums: [4, 5], adminIds: [103] },
      ],
      periodsOff: [],
    },
    C: { activities: [], periodsOff: [] },
  },
  alternatePeriodsOff: {},
};

// camperId 999 doesn't exist -> exercises the "#999" stale-ID fallback.
const NON_BUNK_SCHEDULE: SectionScheduleDoc = {
  type: "NON-BUNK-JAMBO",
  blocks: {
    A: {
      activities: [
        { id: "act-n1", name: "Capture the Flag", description: "All camp CTF", camperIds: [5, 15, 25], staffIds: [56, 66], adminIds: [104] },
        { id: "act-n2", name: "Arts Corner", description: "Free crafts", camperIds: [6, 16, 999], staffIds: [57], adminIds: [] },
      ],
      periodsOff: [],
    },
    B: {
      activities: [
        { id: "act-n3", name: "Pool Party", description: "Open swim", camperIds: [7, 17], staffIds: [58], adminIds: [105] },
      ],
      periodsOff: [],
    },
    C: { activities: [], periodsOff: [] },
  },
  alternatePeriodsOff: {},
};

const FREEPLAY: FreeplayDoc = {
  posts: { "post-gate": [101], "post-office": [102] },
  buddies: { 51: [1, 11], 52: [2, 12], 56: [5, 15] },
};

const PROGRAM_AREAS: Record<string, ProgramAreaDoc> = {
  "A&C": { name: "Arts & Crafts", isDeleted: false, ageGroups: ["NAV", "OCP"] },
  ATH: { name: "Athletics", isDeleted: false, ageGroups: ["NAV", "OCP"] },
  BOAT: { name: "Boating", isDeleted: false, ageGroups: ["NAV", "OCP"] },
};

// Force emulator use before any Firestore call — this script must never be
// able to write to production.
process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
initializeApp({ projectId: "camp-starfish" });
const db = getFirestore();

async function put(path: string, data: FirebaseFirestore.DocumentData): Promise<void> {
  await db.doc(path).set(data);
  console.log(`  wrote ${path}`);
}

async function main() {
  // Preflight 1: emulator reachable? (The admin SDK retries unreachable hosts
  // with long gRPC backoffs instead of failing fast, so probe over HTTP first.)
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  try {
    await fetch(`http://${host}/`, { signal: AbortSignal.timeout(3000) });
  } catch (error) {
    console.error(
      `Could not reach the Firestore emulator at ${host} (${error}).\n` +
      "Start it first:  firebase emulators:start --only auth,firestore,storage --import=./test/emulatorData",
    );
    process.exit(1);
  }

  // Preflight 2: seed data imported?
  const session = await db.doc(`sessions/${SESSION_ID}`).get();
  if (!session.exists) {
    console.error(
      `sessions/${SESSION_ID} does not exist in the emulator — it looks like the seed data was not imported.\n` +
      "Restart the emulators with:  firebase emulators:start --only auth,firestore,storage --import=./test/emulatorData",
    );
    process.exit(1);
  }

  console.log("Seeding test schedules...");

  // NON-BUNK-JAMBO section (session1 ships without one)
  await put(`sessions/${SESSION_ID}/sections/${NON_BUNK_SECTION_ID}`, NON_BUNK_SECTION);

  // Schedule docs
  await put(`sessions/${SESSION_ID}/sections/${BUNDLE_SECTION_ID}/schedule/schedule`, BUNDLE_SCHEDULE);
  await put(`sessions/${SESSION_ID}/sections/${BUNK_JAMBO_SECTION_ID}/schedule/schedule`, BUNK_JAMBO_SCHEDULE);
  await put(`sessions/${SESSION_ID}/sections/${NON_BUNK_SECTION_ID}/schedule/schedule`, NON_BUNK_SCHEDULE);

  // Freeplay docs, keyed the same way the app looks them up: the section
  // start date formatted in LOCAL time (moment .format("YYYY-MM-DD")).
  for (const startDate of Object.values(SECTION_START_DATES)) {
    await put(`sessions/${SESSION_ID}/freeplays/${moment(startDate).format("YYYY-MM-DD")}`, FREEPLAY);
  }

  // Program areas referenced by the bundle schedule (bundle PDF fetches them)
  for (const [areaId, programArea] of Object.entries(PROGRAM_AREAS)) {
    await put(`programAreas/${areaId}`, programArea);
  }

  console.log("\nDone. Sign in as the ADMIN test account and visit:");
  for (const sectionId of [BUNDLE_SECTION_ID, BUNK_JAMBO_SECTION_ID, NON_BUNK_SECTION_ID]) {
    console.log(`  http://localhost:3000/sessions/${SESSION_ID}/${sectionId}`);
  }

  await db.terminate();
}

main();
