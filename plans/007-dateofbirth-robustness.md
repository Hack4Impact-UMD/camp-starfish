# Plan 007: Make user-doc reads tolerate missing dateOfBirth; replace the /test migration page with a script

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- src/data/firestore/users.ts functions/src/data/firestore/users.ts src/app/test scripts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 001 (test harness)
- **Category**: bug
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

`dateOfBirth` became a required `Timestamp` field on user docs recently (PR #247 era). Both user-doc mappers call `userDoc.dateOfBirth.toDate()` unguarded, so **one legacy doc without the field** (or with a string value) makes:

- the entire `/users` admin page crash (the list mapper throws on the first bad doc), and
- **that user unable to sign in**: `checkAllowlist` → `getUserDocByEmail` → the mapper throws a generic `Error`, which the trigger converts to `HttpsError("unknown", ...)`, blocking account creation.

The repo contains the smoking gun: `src/app/test/page.tsx` is a leftover, unauthenticated migration page whose button iterates **all** user docs converting `dateOfBirth` to a `Timestamp` — evidence this data state exists. That page is also a footgun (client-side mass-write; currently blocked by Firestore rules denying client writes to `/users`, but it shouldn't exist). This plan hardens the two mappers, ports the migration to a proper admin script, and deletes the page.

## Current state

- Client mapper, `src/data/firestore/users.ts:21-29`:

```ts
function fromFirestore(snapshot: ...): User {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const userDoc = snapshot.data();
  return {
    id: Number(snapshot.ref.id),
    ...userDoc,
    dateOfBirth: moment(userDoc.dateOfBirth.toDate())
  }
}
```

- Admin mapper, `functions/src/data/firestore/users.ts:18-26` — same pattern (`snapshot.exists` without parens is the only difference).
- The footgun page, `src/app/test/page.tsx` (entire file, 20 lines): a `'use client'` page rendering one "Migrate" button that `getDocs` all of `/users` and `updateDoc`s each with `dateOfBirth: Timestamp.fromDate(moment(userDoc.dateOfBirth).toDate())` and `isSuperAdmin: userDoc.role === "ADMIN" ? false : undefined`. Note `undefined` field values throw in the client SDK unless `ignoreUndefinedProperties` is set — the page is broken as well as dangerous.
- Script exemplar to model the replacement on: `scripts/backfill-session-albums.ts` (uses `firebase-admin` against the running emulators; invoked via `npm run backfill:session-albums` → `npx tsx scripts/...`). Read it before writing the new script.
- Domain type: `User.dateOfBirth: Moment` (required) — `src/types/users/userTypes.ts:15`. Doc type: `BaseUserDoc.dateOfBirth: Timestamp` — `src/data/firestore/types/documents.ts:50`.
- Display usage of `dateOfBirth`: grep before changing semantics — as of `0323f28` it is shown in CSV-upload preview tables and not formatted from `User` objects in many places, but verify.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Frontend typecheck | `npm run compile` | exit 0 |
| Functions typecheck | `npx tsc --noEmit -p functions` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Unit tests | `npm test` | all pass |
| Backfill (manual, emulators running) | `npm run backfill:users` (added by this plan) | prints per-doc results, exit 0 |

## Scope

**In scope** (the only files you should modify/create/delete):
- `src/data/firestore/users.ts` (guard the mapper)
- `functions/src/data/firestore/users.ts` (guard the mapper)
- `src/data/firestore/userMapping.test.ts` or equivalent co-located test (create)
- `scripts/backfill-users.ts` (create)
- `package.json` (add `"backfill:users": "npx tsx scripts/backfill-users.ts"` script only)
- `src/app/test/` (DELETE the directory)

**Out of scope** (do NOT touch):
- `UserDoc`/`User` type definitions — `dateOfBirth` stays required; robustness is at the read boundary only.
- `checkAllowlist`'s error mapping in `functions/src/features/accountManagement.ts` — once the mapper stops throwing, the sign-in path is fixed without touching it.
- Any other mapper (`albumItems`, etc.).

## Git workflow

- Branch: `advisor/007-dateofbirth-robustness`
- Commit style: `bugfix(users): tolerate missing dateOfBirth on user docs; script the backfill`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Guard both mappers

In both `fromFirestore` implementations, replace the unguarded conversion with a tolerant one. Extract a tiny helper in each file (the two trees don't share a module cleanly for this — duplicate the 4 lines, matching each file's style):

```ts
const dateOfBirth = userDoc.dateOfBirth instanceof Timestamp
  ? moment(userDoc.dateOfBirth.toDate())
  : moment.invalid();
```

`moment.invalid()` is a real `Moment` (satisfies the type) whose `.isValid()` is false and which formats as "Invalid date" — the users list renders instead of crashing, and `checkAllowlist` sign-in proceeds. Import `Timestamp` from `firebase/firestore` (client) / `firebase-admin/firestore` (admin).

**Verify**: `npm run compile` and `npx tsc --noEmit -p functions` → exit 0.

### Step 2: Unit-test the client mapper guard

The mapper takes a `DocumentSnapshot`; rather than mocking one, extract the conversion into an exported pure helper (e.g. `export function userDocToUser(id: string, userDoc: UserDoc): User`) called by `fromFirestore`, and test that: a doc with a valid `Timestamp` yields a valid Moment; a doc with `dateOfBirth: undefined` (cast as needed for the malformed case) yields an invalid-but-present Moment and does NOT throw. Mirror in a small test for the functions-tree helper if trivially possible; otherwise client-side coverage suffices (note it).

**Verify**: `npm test` → all pass.

### Step 3: Port the migration to `scripts/backfill-users.ts`

Model on `scripts/backfill-session-albums.ts` (read it first; reuse its emulator-connection approach and logging style). Behavior, per `/users` doc:

- if `dateOfBirth` exists but is not a `Timestamp` (e.g. string): set `dateOfBirth: Timestamp.fromDate(new Date(raw))`, skipping values that don't parse (log them);
- if `role === "ADMIN"` and `isSuperAdmin` is missing: set `isSuperAdmin: false`;
- never write `undefined` values (the original page's bug); log a summary line (`updated N, skipped M, flagged K`).

Add the npm script. The script targets the **emulator** by default like its exemplar; if the exemplar has an explicit env guard for prod, copy it exactly.

**Verify**: with emulators running (`firebase emulators:start --import=./test/emulatorData`), `npm run backfill:users` exits 0 and prints a summary. Re-running prints `updated 0` (idempotent).

### Step 4: Delete the /test page

Remove `src/app/test/page.tsx` (and the now-empty `src/app/test/` directory).

**Verify**: `ls src/app/test` → No such file or directory; `npm run compile` → exit 0; `grep -rn "app/test" src` → no matches.

## Test plan

Step 2 (mapper guard cases). Plus the Step-3 idempotency check (run twice). Model test structure on plan-001 files.

## Done criteria

- [ ] `grep -n "dateOfBirth.toDate()" src/data/firestore/users.ts functions/src/data/firestore/users.ts` → no unguarded matches
- [ ] `src/app/test/` no longer exists
- [ ] `scripts/backfill-users.ts` exists; `npm run backfill:users` works against emulators and is idempotent
- [ ] `npm test`, `npm run compile`, `npx tsc --noEmit -p functions`, `npm run lint` all exit 0
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `scripts/backfill-session-albums.ts` connects to production by default (no emulator env guard) — copy nothing until the operator confirms the intended target; report what you found.
- Grep shows UI code calling `.toDate()`/`.format()` on `user.dateOfBirth` in ways that crash on an invalid Moment (an invalid Moment formats as a string, so this should be safe — but if you find a call path that throws, list it instead of patching UI files).
- `src/app/test/page.tsx` has gained imports/links from elsewhere since `0323f28` (`grep -rn "app/test\|/test\"" src` before deleting).

## Maintenance notes

- The proper long-term fix is clean data: run the backfill against production (operator action, with the emulator-tested script) and then this guard becomes a belt-and-suspenders.
- If/when the moment→dayjs consolidation happens (deferred — see plans/README.md), `moment.invalid()` maps to `dayjs(NaN)`; keep the "invalid but present" semantics.
- Reviewers: check no `undefined` can reach a Firestore write in the backfill script — that was the original page's bug.
