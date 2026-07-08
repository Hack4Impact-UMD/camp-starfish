# Scheduling Generation — Work In Progress

This branch (`scheduling-generation-wip`) holds the schedule-**generation UI** work that is
**not production-ready**. It was peeled off `General-Fixes-and-UI-Improvements` on 2026-07-08
because these features either produce **incorrect output**, are **unverified**, or depend on
**prerequisites that don't exist yet** (data-creation UIs, and one data-model decision). The
`General-Fixes-and-UI-Improvements` branch keeps only the fixes that work and stand alone.

> The scheduling **engine** (six generator functions), the ActivityGrid, the activities editor,
> and the PDF export were all built earlier by the Hack4Impact-UMD team and are not in question.
> What lives here is the **UI wiring** that lets a user *trigger* generation — the part that was
> missing and is still early-stage.

---

## Commits on this branch (on top of the shared, working base)

| Commit | Feature |
|---|---|
| `2cb6a81` | Section-page **GENERATE** button (BUNDLE prototype) |
| `f5999af` | `posts` data module + `usePosts` hook |
| `f9c41ab` | Session **"Scheduling" panel**: days-off + night-schedule generation + `NightScheduleTable` |
| `e8800fa` | **Freeplay** generation subsection |

**Deliberately left on the main branch** (because it works and is independent): the generator
crash-fixes + first unit tests (`d1d947f`). It hardens `generateBundleSchedule` (6 real bug fixes)
and adds a Vitest suite. Keeping it there does **not** make generation "work" end-to-end — see D1.

Base of this branch: `12435d2` (last shared commit) + `d1d947f` (kept on both) + the four above.

---

## What each piece does, and precisely why it is not ready

### 1. Section-page GENERATE button — `2cb6a81` — LOGICALLY INCORRECT

**What it does:** Adds a "GENERATE" button to the section page (`SectionPage.tsx`) for **BUNDLE
sections only**. It gathers attendees, activity preferences, the current schedule (activity
layout), and the days-off schedule, runs `generateBundleSchedule`, persists the result, and the
ActivityGrid re-renders with people assigned.

**Why it does not fully work:**
- **The core bug (blocks correctness):** `generateBundleSchedule` routes its special logic —
  waterfront/swim distribution, OCP chat, and program-counselor placement — by matching
  `activity.programAreaId` against hard-coded codes (`"WF"`, `"OCP"`) and against each staffer's
  `programCounselorFor`. But activities created in the **activities editor** store the *category
  name* in `programAreaId` (e.g. `"Arts & Crafts"`) and create their program-area docs with
  **uuid** ids — while seeded/generated data uses the program-area **doc id as a short code**
  (`"A&C"`, `"ATH"`). So for any editor-authored activity, those `=== "WF"` / `=== "OCP"` checks
  never match: the special swim/OCP handling silently doesn't run and campers fall through to the
  generic distribution. It won't crash (crashes were fixed in `d1d947f`), but the output is wrong.
  **This is blocked on decision D1 below.**
- **Only BUNDLE sections have a trigger** — BUNK-JAMBO and NON-BUNK-JAMBO have none.
- **Never runtime-verified.** Its inputs (preferences, days-off) must all exist or the button
  stays disabled; against raw seed data those docs are missing, so it likely just shows disabled.

### 2. Session "Scheduling" panel — days-off + nights — `f9c41ab` — UNVERIFIED + MISSING INPUTS

**What it does:** Adds a `SessionSchedulingPanel` to the session detail page with a multi-date
picker + "Generate days off" (runs `generateDaysOffSchedule`, converts Moments→Timestamps,
persists) and "Generate night schedules" (runs `generateNightSchedules`, persists one doc per
date), then mounts `NightScheduleTable` to display the result.

**Why it does not fully work:**
- **Never runtime-verified.** Compiles and the data flow is correct by inspection, but exercising
  it needs the emulator with seeded attendees and bunks — not done.
- **Night generation depends on bunks, and there is no UI that creates bunks.** The `bunks`
  collection is write-orphaned (nothing calls its create/update functions). Without seeded/console
  bunks, night generation has nothing to assign. **Blocked on prerequisite P1 below.**
- Days-off generation **throws** `"No days off in week"` if any full week in the session has zero
  selected days off. It's caught → shown as an error notification, but the user must know to pick
  at least one day per week.
- Regenerating days-off **after** nights exist silently makes the nights stale (no cascade/warning).
- `NightScheduleTable` has an unguarded `daysOffByCounselorId[staffId].some(...)` — safe only
  because the generator populates every counselor; a latent crash if the data is ever partial.

### 3. Freeplay generation — `e8800fa` — UNVERIFIED + NO POSTS

**What it does:** Adds a Freeplay subsection to the panel: pick a day, run
`generateFreeplaySchedule` (attendees + the session's posts + other freeplays), persist.

**Why it does not fully work:**
- **Never runtime-verified** (same emulator/seed reason).
- **It assigns people to "posts", but there is no UI to create posts.** So in practice the `posts`
  collection is empty and freeplay generates with empty post assignments. It won't error — it just
  produces a nearly-empty result. **Blocked on prerequisite P2 below.**
- The generator **throws** if posts requiring admin supervision exceed available admins — caught
  and surfaced as the generator's own message.

### 4. `posts` data module — `f5999af` — WORKS, BUT DEAD ON ITS OWN

**What it does:** Adds `src/data/firestore/posts.ts` (full CRUD data functions) + `usePosts` list
hook, mirroring `programAreas`. The `posts` root collection, its `PostDoc` type, and its
staff/admin firestore rule already existed — this only adds client access.

**Why it is not "done":** It compiles and is correct, but its **only consumer is freeplay
generation (#3)**, and its create/update/delete functions have **no caller** because there is no
posts-management UI (P2). So on its own it delivers nothing user-visible.

---

## Decisions that must be made before this ships (owner: tech leads)

### D1. `programAreaId` canonical identity — BLOCKS #1 and all bundle generation

There are three conflicting conventions in the codebase for what `activity.programAreaId` holds
(program-area doc-id-as-code, uuid doc id + name, and the generator's hard-coded `"WF"`/`"OCP"`).
Before generation can be correct, the team must decide:

1. **Canonical identity:** Is a program area identified by a **meaningful short-code doc id**
   (seed convention, `"A&C"`) or a **uuid + a separate `code` field**? Both producers (the
   activities editor and the seed/generator) must obey one choice.
2. **Are `WF`/`OCP` fixed, always-present program areas?** The generator hard-codes them. If an
   admin can rename/delete them in the editor, generation silently breaks. Recommended: add a
   `code`/`role` enum on ProgramArea (`SWIM`, `OCP`, `GENERAL`) that the generator switches on,
   instead of string-matching ids.
3. **`programCounselorFor` identifier space** must equal `activity.programAreaId`'s. Its value is
   set by the (not-yet-built) attendee-import CSV, so **this decision constrains that CSV mapping**
   — decide them together.
4. **Camper-preferences keying:** `BlockActivityPreferences` types the inner map as
   `{ [activityId]: number }`, but the generator reads `camperPrefs[programAreaId]`. Resolve
   whether preferences are per-activity or per-program-area.

Recommended path (pending D1.1/D1.2): standardize on program-area **doc ids** everywhere, add a
`code` enum the generator switches on, make the editor write doc ids (id↔name for display), keep
the existing id-or-name resolution shim (`DownloadDaySchedulePDFButton` / `useProgramAreaBatch`)
during migration, then backfill name-based ids and drop the shim. **Extend the `d1d947f` test suite
with WF/OCP-routing cases *before* touching the generator.**

### D2. Publish lifecycle

`publishedAt` is currently just a timestamp. Decide what publishing should actually *do*: freeze
edits? gate the PDF export? control non-admin visibility? And where the (currently dead)
`unpublishSectionSchedule` surfaces.

---

## Prerequisites that must be built (separate work)

- **P1 — Bunks creation UI.** The `bunks` collection is write-orphaned; night generation (#2) and
  bunk-jamboree generation need it. (Likely fed by the same attendee import — attendee rows carry a
  `bunk` number.)
- **P2 — Posts management UI.** Needed for freeplay (#3) to have anything to assign. Add the
  deferred create/update/delete mutation hooks (mirror `useCreateProgramArea`) + a small admin UI.
- **P3 — Attendee import (CampMinder CSV).** Nothing currently creates session attendees, so *all*
  generation is starved of people in a real deployment. This is a separate track; its CSV column
  contract is an external unknown that must come from the tech leads, and it couples to D1.3.

---

## Checklist to make each piece production-ready

- [ ] Answer D1 (canonical `programAreaId` identity + WF/OCP handling) and D1.3 with the attendee-import owner.
- [ ] Add `ProgramArea.code`; make the generator switch on it; extend tests first.
- [ ] Make the activities editor write program-area **doc ids** (not names); id↔name display map.
- [ ] Backfill existing name-based `programAreaId`s → doc ids; remove the id-or-name shim.
- [ ] Build P1 (bunks UI) and P2 (posts UI); add the deferred posts mutation hooks.
- [ ] Runtime-verify every trigger against the emulator with seeded attendees / bunks / posts.
- [ ] Add generation triggers for BUNK-JAMBO / NON-BUNK-JAMBO (only BUNDLE has one today).
- [ ] Decide D2 (publish lifecycle); surface `unpublishSectionSchedule`.
- [ ] Warn/cascade when regenerating days-off invalidates existing night schedules.

## Verification status

**None of the four features on this branch was runtime-tested.** They pass `npm run compile`,
`npm run lint`, and (for the generator) `npm test` — verification is by type-check and reading
only. Runtime verification requires `firebase emulators:start --import=./test/emulatorData` +
`npm run dev` with seeded attendees, bunks, and posts (see `scripts/seed-test-schedules.ts` for
the schedule/program-area seed helper).
