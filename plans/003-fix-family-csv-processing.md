# Plan 003: Fix broken existing-user detection in processFamilyCsv

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- functions/src/features/userCsvProcessing.ts functions/src/data/firestore/users.ts src/features/userManagement`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW–MED — admin-only callable; bad fix could corrupt user docs, but tests + transaction semantics contain it
- **Depends on**: 001 (Vitest harness for the new unit tests)
- **Category**: bug
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

The family-CSV upload callable is supposed to *merge* re-uploads: detect campers/parents that already exist and `arrayUnion` new family links instead of recreating them. That detection is broken: `Object.keys()` is called on **arrays**, which returns array indices (`"0", "1", ...`), not CampMinder IDs. Existing users are therefore never detected, every row is treated as new, and because the data layer uses Firestore `.create()` (which throws `ALREADY_EXISTS`), **re-uploading any CSV containing an already-imported camper or parent fails the entire transaction**. The whole merge/update branch is dead code. Two secondary defects in the same function: the existing-users read doesn't go through the transaction, and `Promise.all` is awaited over an array of *arrays*.

## Current state

- `functions/src/features/userCsvProcessing.ts` — the broken callable. The bug, verbatim (lines 27–33):

```ts
  await adminDb.runTransaction(async (transaction) => {
    const allIds: number[] = [...Object.keys(campers), ...Object.keys(parents)].map(id => parseInt(id));
    const existingUsers = await batchGetUserDocs(allIds);
```

  `campers` and `parents` are **arrays** (built at lines 18–25 via `input.campers.map(...)`), so `Object.keys` yields indices, and `batchGetUserDocs` is not passed `transaction`. Lines 34–66 build `promises` as an array of four **arrays** of promises and `await Promise.all(promises)` — it only works today because transaction writes queue synchronously; it must be flattened. The update branches (lines 49–64) compare names but then only `arrayUnion` the id-links — a changed name is silently dropped.

- `functions/src/data/firestore/users.ts:33-36` — `batchGetUserDocs(ids: number[], transaction?: Transaction)` already accepts a transaction and batches `__name__ in` queries in chunks of 30 (missing ids are simply absent from results — it does NOT throw for them).
- `functions/src/data/firestore/firestoreAdminOperations.ts:21-30` — `createDoc` uses `.create()` → throws `Error("Document already exists")` on conflict. This is why the bug fails closed (full transaction abort) rather than overwriting data.
- Request shape, `src/features/userManagement/useProcessFamilyCsv.ts:6-9`:

```ts
export interface ProcessFamilyCsvRequest {
  campers: Pick<Camper, "id" | "name" | "parentIds" | "gender" | "dateOfBirth">[];
  parents: Pick<Parent, "id" | "name" | "email" | "camperIds" | "gender" | "dateOfBirth">[];
}
```

- Domain types: `src/types/users/userTypes.ts` — `Camper` has `parentIds: number[]`, `nonoListIds: number[]`, `photoPermissions`; `Parent` has `camperIds: number[]`, required `email`. `id` is the CampMinder id and the Firestore doc id (stringified).
- `processEmployeeCsv` in the same file computes ids correctly (`employees.map(employee => employee.id)`, line 81) — do not "fix" it; it's only touched if you extract shared helpers.
- Note: functions' `@/*` alias resolves to the repo-root `src/` tree (`functions/tsconfig.json` paths) — that's intentional in this repo.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Functions typecheck | `npx tsc --noEmit -p functions` | exit 0 |
| Functions lint | `npm --prefix functions run lint` | exit 0 |
| Unit tests | `npm test` | all pass, incl. new reconciliation tests |
| Frontend typecheck | `npm run compile` | exit 0 |

## Scope

**In scope** (the only files you should modify/create):
- `functions/src/features/userCsvProcessing.ts`
- `functions/src/features/userCsvReconciliation.ts` (create — pure logic extracted for testability)
- `functions/src/features/userCsvReconciliation.test.ts` (create)

**Out of scope** (do NOT touch):
- `functions/src/data/firestore/*` — the data layer is correct for this plan's needs.
- `src/features/userManagement/*` — the client-side parse/upload flow is fine.
- Zod validation of `req.data`, `isSuperAdmin` on admin docs, error-message fixes — those belong to plan 004 (it edits this same file; run 003 first).
- `processEmployeeCsv`'s behavior (other than mechanical reuse of an extracted helper, and only if zero behavior change).

## Git workflow

- Branch: `advisor/003-fix-family-csv`
- Commit style: `bugfix(users): fix existing-user detection in processFamilyCsv`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract a pure reconciliation function

Create `functions/src/features/userCsvReconciliation.ts` with **no imports of `../config/firebaseAdminConfig` or anything that initializes the Admin SDK** (so tests can import it without credentials). Shape:

```ts
import { User } from "@/types/users/userTypes";
import partition from "@/utils/data/partition";

export interface FamilyCsvCamperRow { id: number; name: ...; parentIds: number[]; gender: ...; dateOfBirth: string; }
export interface FamilyCsvParentRow { id: number; name: ...; email: string; camperIds: number[]; gender: ...; dateOfBirth: string; }

export interface FamilyCsvReconciliation {
  newCampers: FamilyCsvCamperRow[];
  newParents: FamilyCsvParentRow[];
  camperUpdates: { id: number; name: ...; parentIds: number[] }[];   // only dirty ones
  parentUpdates: { id: number; name: ...; camperIds: number[] }[];   // only dirty ones
}

export function reconcileFamilyCsv(
  campers: FamilyCsvCamperRow[],
  parents: FamilyCsvParentRow[],
  existingUsers: User[],
): FamilyCsvReconciliation { ... }
```

Derive the row types from `ProcessFamilyCsvRequest` (import the type from `@/features/userManagement/useProcessFamilyCsv` like the current code does) rather than redeclaring fields if that's cleaner. Logic to implement:

1. `existingIds = new Set(existingUsers.map(u => u.id))`; partition campers/parents on membership (use the existing `partition` util, as today).
2. A row is **dirty** (needs update) when the existing doc's `name.firstName`/`middleName`/`lastName` differ from the row's, OR the row's `parentIds`/`camperIds` contain an id not already in the existing doc's list. (This preserves the current code's *check*, lines 52 and 60, but fixes what happens on a name change — see step 2.)
3. Return non-dirty existing rows in neither list (skip).

**Verify**: `npx tsc --noEmit -p functions` → exit 0.

### Step 2: Rewrite `processFamilyCsv` to use it

In `functions/src/features/userCsvProcessing.ts`:

```ts
await adminDb.runTransaction(async (transaction) => {
  const allIds = [...campers.map(c => c.id), ...parents.map(p => p.id)];
  const existingUsers = await batchGetUserDocs(allIds, transaction);   // pass the transaction
  const plan = reconcileFamilyCsv(campers, parents, existingUsers);

  const promises = [
    ...plan.newCampers.map(camper => createUserDoc(...)),       // same doc shape as today (role, photoPermissions: "PRIVATE", nonoListIds: [], Timestamp dateOfBirth)
    ...plan.newParents.map(parent => createUserDoc(...)),
    ...plan.camperUpdates.map(u => updateUserDoc(u.id, { name: u.name, parentIds: FieldValue.arrayUnion(...u.parentIds) }, transaction)),
    ...plan.parentUpdates.map(u => updateUserDoc(u.id, { name: u.name, camperIds: FieldValue.arrayUnion(...u.camperIds) }, transaction)),
  ];
  await Promise.all(promises);
});
```

Behavior changes, all intentional: (a) ids come from `.id`; (b) reads go through the transaction; (c) the promise array is flat; (d) a dirty row now also updates `name` (the CSV is the CampMinder source of truth), not just the id-links. Keep everything else — moment/Timestamp conversion, doc shapes — exactly as today. Firestore requires all transaction reads before writes: the single `batchGetUserDocs(..., transaction)` call already precedes all writes; keep it that way.

**Verify**: `npx tsc --noEmit -p functions` → exit 0; `npm --prefix functions run lint` → exit 0.

### Step 3: Unit-test the reconciliation

`functions/src/features/userCsvReconciliation.test.ts` (runs via the root Vitest config from plan 001 — its `include` already covers `functions/src/**/*.test.ts`). Build `User` fixtures with moment dateOfBirth as needed. Cases:

1. all-new campers and parents → everything in `newCampers`/`newParents`, no updates
2. existing camper, same name, `parentIds` ⊆ existing → skipped entirely (in no list) — **this is the regression test for the `Object.keys` bug**: feed a camper whose `id` is e.g. `4521096` and assert it is NOT in `newCampers` when a matching `User` is in `existingUsers`
3. existing camper with a new parentId → appears in `camperUpdates` with that parentId
4. existing parent with a changed last name → appears in `parentUpdates` (name update)
5. mixed batch: 2 new + 1 dirty + 1 clean → correct partition of all four
6. empty input → all lists empty

**Verify**: `npm test` → all pass including the 6 new cases.

### Step 4: Emulator smoke (optional but recommended)

If emulators are available: `firebase emulators:start --import=./test/emulatorData`, run the app, open `/users` as an admin, upload a small family CSV twice (the UploadUsersCsvModal flow). First upload creates; second upload must succeed (no "Document already exists") and not duplicate.

**Verify**: second upload returns success; user count unchanged after re-upload.

## Test plan

Step 3 above. Model structure on the plan-001 test files (`src/utils/data/partition.test.ts`). No mocking of Firestore — the extracted function is pure.

## Done criteria

- [ ] `grep -n "Object.keys(campers)\|Object.keys(parents)" functions/src/features/userCsvProcessing.ts` → no matches
- [ ] `batchGetUserDocs` call inside `processFamilyCsv` passes `transaction` (visual check + cite the line in your report)
- [ ] `npm test` exits 0 with the 6 new reconciliation tests passing
- [ ] `npx tsc --noEmit -p functions` exits 0; `npm --prefix functions run lint` exits 0
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live `userCsvProcessing.ts` no longer matches the Current state excerpt (someone fixed or refactored it since `0323f28`).
- Importing `ProcessFamilyCsvRequest` (or anything from `@/features/userManagement/...`) into the new pure module pulls in `firebase/functions` client code that breaks `tsc -p functions` — report the import chain.
- You find call sites of `processFamilyCsv` other than `src/features/userManagement/useProcessFamilyCsv.ts` whose expectations conflict with the name-update behavior change.
- Vitest cannot resolve `@/` imports from `functions/src/**` test files (plan 001's alias should cover it; if not, report rather than adding per-file relative-path hacks).

## Maintenance notes

- Plan 004 edits this same file (Zod validation, `isSuperAdmin`); land 003 first to avoid conflicts.
- The name-update behavior means a CSV re-upload overwrites manual name edits made in Firestore. That's consistent with CampMinder-as-source-of-truth, but if a manual-edit UI is ever built, this needs a conflict policy.
- `batchGetUserDocs` uses `in` queries in chunks of 30 inside one transaction — fine at camp scale (hundreds of rows). A 10k-row CSV would need a different batching strategy; don't optimize now.
- Reviewers: scrutinize Step 2's doc shapes against the originals (`photoPermissions: "PRIVATE"`, `nonoListIds: []`, Timestamp conversion) — silent shape drift here corrupts new user docs.
