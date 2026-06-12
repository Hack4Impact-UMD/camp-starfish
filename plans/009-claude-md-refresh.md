# Plan 009: Bring CLAUDE.md (and README run-instructions) back in sync with the code

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: this plan documents *current* code — run it
> last among the selected plans (see plans/README.md execution order) and
> describe whatever is true at execution time, re-verifying every claim
> below against the live tree.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW — docs only
- **Depends on**: best run after 002–008 have landed (it must describe their end state)
- **Category**: docs
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

CLAUDE.md is the agent-facing map of this repo, and the repo's own convention is that agents read it before changing anything. It has drifted in ways that actively mislead: wrong framework versions, a described auth backdoor that no longer exists, and **no mention of the user-management feature** — the most actively developed code in the repo (PRs #216, #246–252). Stale agent docs are worse than missing ones: an executor "fixing" code to match the doc would reintroduce removed behavior.

## Current state — the specific drift to fix (re-verify each at execution time)

1. **§2 Tech Stack versions** — says Next.js `^15.5.9`, Mantine `^8.3.18`. Actual (`package.json` at `0323f28`): `next 16.2.6`, Mantine `^9.2.1`, plus `@mantine/schedule` (new, used by `SessionCalendar`), `csv-parse`, `jszip`, `lucide-react`/`react-router-dom`/`cookie` (slated for removal in plan 008 — describe whatever is true when you run). The "tanstack ^1.0.3 is suspicious" item in §11.11 is resolved (gone from package.json).
2. **§8 Authentication** — says `checkAllowlist` grants `role: "ADMIN"` in dev / for `DEV_EMAILS`/`NPO_EMAILS`. That backdoor **no longer exists**: `functions/src/features/accountManagement.ts` (read it) now looks up `/users` by email, assigns `{ role, campminderId }` (+ `isSuperAdmin: false` for admins), and rejects unknown emails. Also document: claims are set **only at account creation** — role changes/deletions do not propagate to existing tokens (callable `deleteUserAccount` deletes the Auth account for that reason).
3. **Missing: the user-management feature.** Add to §4/§5 (and the route table): `/users` route (ADMIN-only, `src/app/users/UsersPage.tsx` — TanStack Table, search/role-filter/sort/pagination, CSV upload entry; delete column currently commented out per PR #251); client feature `src/features/userManagement/` (CSV parse with Zod + process hooks); Cloud Functions `processFamilyCsv`/`processEmployeeCsv` (`functions/src/features/userCsvProcessing.ts`), `deleteUserAccount` (`accountManagement.ts`); the `userDirectory` paged projection (`functions/src/features/userDirectory.ts`, consumed by `src/hooks/users/useUserDirectory.ts`, TagSelect, AddTagModal) and its `/userDirectory` Firestore collection + rules entry; hooks `src/hooks/users/*`.
4. **§3/§4 structure drift** — `src/app/test/` exists at `0323f28` but is deleted by plan 007 (omit it if already gone); `scripts/` gained `seed-parent-album-test.ts`, `backfill-session-albums.ts` (and `backfill-users.ts` after plan 007); `src/data/` per-collection modules live under `src/data/firestore/` (the doc's §4 list implies `src/data/*.ts` — verify actual paths with `ls src/data` and fix the section).
5. **§9 Data model** — add `userDirectory/{pageId}` to the collections diagram; note `users/{userId}` doc ids are CampMinder ids; mention `isSuperAdmin` on admin docs.
6. **§10/§11 status updates** — if plans 001–008 have landed by execution time: tests exist (`npm test`, Vitest — rewrite §10 "Tests" accordingly); storage rules are no longer wide open (§11.1 — rewrite to describe the role-gated rules and the accepted parent-read coarseness); `firestore.indexes.json` is no longer empty (§11.3); update §11.8 console-statement list (currently only `src/components/UploadUsersCsvModal/EmployeeUsersInputTable.tsx` has one — re-grep).
7. **README.md** — two known wrong items (§11.12–13 of CLAUDE.md self-reports them): structure tree references `tailwind.config.ts`/`eslint.config.mjs` (actual: Tailwind v4 with no config file, `eslint.config.ts`), and the emulator import path `./testData` (actual: `./test/emulatorData`). Fix both in README.md.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Verify versions | `node -e "const p=require('./package.json');console.log(p.dependencies.next, p.dependencies['@mantine/core'])"` | matches what you write |
| Verify routes | `ls src/app` | matches the route table you write |
| Verify console sweep | `grep -rln "console\.\(log\|error\|warn\)" src --include="*.ts*"` | matches §11.8 claim |
| No code changed | `git status --short` | only CLAUDE.md, README.md |

## Scope

**In scope**: `CLAUDE.md`, `README.md`.

**Out of scope** (do NOT touch): everything else. This plan never changes code to match docs — docs follow code. Do not rewrite sections that are still accurate (e.g. §7 styling, §6 apps-script) beyond spot-verifying a claim you happen to read.

## Git workflow

- Branch: `advisor/009-claude-md-refresh`
- Commit style: `docs(claude): sync CLAUDE.md and README with current code`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Verify every claim in the drift list

Run the verification greps/`ls`/reads cited above against the live tree. Build your own corrected fact list — items already fixed by other plans' execution get described in their *current* state.

**Verify**: each numbered drift item has a live citation (file:line or command output) in your notes.

### Step 2: Edit CLAUDE.md

Apply the seven corrections. Match the existing document's voice and structure (tables for routes/stack, terse bullet style, ⚠️ markers for live risks). Keep §11 numbering stable where possible; mark resolved items as ~~struck~~ "Resolved" the way the document already does for the firestore-rules item (see §11.2 for the established pattern).

**Verify**: `grep -n "15.5.9\|8.3.18\|DEV_EMAILS\|NPO_EMAILS" CLAUDE.md` → no stale matches (unless describing history); `grep -n "userDirectory\|UsersPage\|processFamilyCsv" CLAUDE.md` → present.

### Step 3: Fix README.md

The two items in drift entry 7. Also spot-check the README's quick-start commands against `package.json` scripts while you're there.

**Verify**: `grep -n "testData\|tailwind.config.ts\|eslint.config.mjs" README.md` → no matches (except a correct `test/emulatorData`).

## Test plan

Docs-only; the greps above are the tests.

## Done criteria

- [ ] All Step 2 and Step 3 grep gates pass
- [ ] Route table in CLAUDE.md §4 lists `/users` (ADMIN) and no longer lists deleted routes
- [ ] §8 describes the current `checkAllowlist` behavior and the claims-only-at-creation constraint
- [ ] `git status --short` shows only `CLAUDE.md` and `README.md`
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- A claim in this plan's drift list is itself wrong against the live tree (e.g. someone restored a dev allowlist in `checkAllowlist`) — report the discrepancy; don't document your guess.
- CLAUDE.md has been substantially restructured since `0323f28` (the section numbers no longer match) — re-map the corrections to the new structure only if unambiguous.

## Maintenance notes

- CLAUDE.md churns with every feature branch in this repo (7 edits in the last 60 commits) — drift will recur. Suggested habit for the team: PRs that add a route, collection, or Cloud Function must touch CLAUDE.md in the same diff.
- Plans 002–008 each note their own CLAUDE.md-relevant outcome; if this plan runs *before* any of them, leave those sections describing the pre-plan state and note the pending plans instead of pre-documenting unlanded changes.
