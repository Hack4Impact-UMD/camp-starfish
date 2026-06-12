# Plan 006: Fix userDirectory trigger transaction logic and add delete sync

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- functions/src/features/userDirectory.ts functions/src/data/firestore/userDirectory.ts functions/src/index.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — Firestore trigger + transaction semantics; bugs here corrupt the directory projection
- **Depends on**: 001 (test harness)
- **Category**: bug
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

The `userDirectory` collection is a paged projection of `/users` (`{ [campminderId]: { name, role } }` per page doc) consumed by the tagging UI (`src/components/TagSelect.tsx`, `AlbumItemViewModal/AddTagModal.tsx`) and `SmallDirectoryBlock`. Its maintaining triggers have three defects:

1. **Dead error handling.** Both triggers wrap `transaction.update(...)` calls in try/catch expecting a NOT_FOUND throw. But Firestore **transaction writes are buffered** — `Transaction.update()` queues the write and returns the transaction synchronously; NOT_FOUND surfaces only at commit. The catch branches (the "page is full / missing → create a new page" logic) can never execute.
2. **Reads after writes.** The `onUserUpdated` catch path issues an aggregate **read** after an `update` **write** in the same transaction. Firestore rejects this ("all reads must be executed before all writes") — so even if the catch could fire, it would crash.
3. **No delete sync.** There is no `onDocumentDeleted` trigger, so when `deleteUserAccount` removes a user, the directory entry remains forever — deleted users stay selectable in the photo-tagging UI. This also blocks the "restore user deletion" feature (plan 010).

## Current state

- `functions/src/features/userDirectory.ts` (entire file is 76 lines — read it all). The broken catch in `onUserUpdated` (lines 40–50):

```ts
    const doc = docs[0];
    try {
      await updateUserDirectoryDoc(doc.page, directoryDataUpdates, transaction);
    } catch {
      await updateUserDirectoryDoc(doc.page, { [userId]: FieldValue.delete() }, transaction);
      const { docCount } = await aggregateUserDirectoryDocs({ transaction, ... });   // READ after WRITE
      await createUserDirectoryDoc(docCount, directoryDataUpdates, transaction);
    }
```

  And in `appendUserDirectoryItem` (lines 66–70):

```ts
    try {
      await updateUserDirectoryDoc(docCount - 1, directoryData, transaction);
    } catch {
      await createUserDirectoryDoc(docCount, directoryData, transaction);
    }
```

- The page-locating trick in `onUserUpdated` (lines 27–33): query the collection with `orderBy(userId)` — `orderBy` on a field doubles as an existence filter, so only pages containing that user key match. This works (Firestore auto-indexes map sub-fields) — **keep the technique**.
- `functions/src/data/firestore/userDirectory.ts` — thin CRUD helpers (`getUserDirectoryDoc`, `executeUserDirectoryQuery`, `createUserDirectoryDoc`, `updateUserDirectoryDoc`, `deleteUserDirectoryDoc`, `aggregateUserDirectoryDocs`). All accept an optional `Transaction`. No changes needed here.
- `updateDoc` wrapper semantics (`functions/src/data/firestore/firestoreAdminOperations.ts:59-69`): with a `Transaction` instance, `instance.update(ref, data)` is awaited but resolves immediately (write is buffered) — confirming defect 1.
- Trigger registration: `functions/src/index.ts` spreads `userDirectoryCloudFunctions` (exported at `userDirectory.ts:74-77` as `{ onUserCreated, onUserUpdated }`).
- Doc shape: `UserDirectoryDoc = Omit<UserDirectory, "page">` (`src/data/firestore/types/documents.ts:27`); `UserDirectory` lives in `src/types/albums/albumTypes.ts` (an odd home, but out of scope to move).
- Triggers use Firebase Functions v2: `onDocumentCreated`, `onDocumentUpdated` from `firebase-functions/firestore` — `onDocumentDeleted` comes from the same module.
- The client merges all pages and drops the `page` key: `src/hooks/users/useUserDirectory.ts:5-11`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Functions typecheck | `npx tsc --noEmit -p functions` | exit 0 |
| Functions lint | `npm --prefix functions run lint` | exit 0 |
| Unit tests | `npm test` | all pass |
| Emulator run | `firebase emulators:start --import=./test/emulatorData` | functions emulator loads the new trigger |

## Scope

**In scope** (the only files you should modify/create):
- `functions/src/features/userDirectory.ts`
- `functions/src/index.ts` (only if the export spread doesn't automatically pick up the new trigger — check how `userDirectoryCloudFunctions` is consumed)
- `functions/src/features/userDirectory.test.ts` (create — pure helper tests only)

**Out of scope** (do NOT touch):
- `functions/src/data/firestore/userDirectory.ts` and `firestoreAdminOperations.ts` — the data layer is fine.
- The client hook `src/hooks/users/useUserDirectory.ts` and its consumers.
- Backfilling/repairing existing directory data — note it as a follow-up if the emulator data looks stale.
- Moving `UserDirectory` types out of `albumTypes.ts`.

## Git workflow

- Branch: `advisor/006-userdirectory-rework`
- Commit style: `bugfix(users): fix userDirectory transaction logic and sync deletes`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Replace catch-based control flow with read-based checks

Rewrite the transaction bodies so every decision is made from **reads performed up front**, with writes last and no try/catch around buffered writes:

- Introduce `const MAX_ENTRIES_PER_PAGE = 1000;` (each entry is ~60 bytes; 1000 keeps pages far below the 1 MiB doc limit).
- `appendUserDirectoryItem(userId, item)`: inside the transaction — (read) query the **last page** by `__name__` descending limit 1 (or keep the aggregate-count read; either is fine, but you need the page *contents* to count entries, so prefer reading the last page doc directly via `executeUserDirectoryQuery({ transaction, queryOptions: { orderBy: [{ fieldPath: "__name__", direction: "desc" }], limit: 1 } })` — note doc ids are numeric strings, so lexicographic `__name__` ordering breaks at page 10; safer: keep `aggregateUserDirectoryDocs` count read, then `getUserDirectoryDoc(docCount - 1, transaction)` to read the last page). Then decide: no pages → create page `0`; last page has `< MAX_ENTRIES_PER_PAGE` keys (count `Object.keys`, excluding none — the doc has only user-id keys) → update it; else → create page `docCount`. All writes after all reads.
- `onUserUpdated`: inside the transaction — (read 1) the existence-filter query for the page containing `userId` (keep as-is); if found → update that page (the entry exists, so no capacity concern); if not found → run the same append logic as above (reads first). Easiest structure: extract a helper `appendWithinTransaction(transaction, userId, item)` whose reads happen before any caller writes — i.e., perform ALL reads at the top of each trigger's transaction, then branch into writes.
- Remove the now-unneeded `FieldValue.delete()` + re-create dance in `onUserUpdated`'s catch path entirely.

**Verify**: `npx tsc --noEmit -p functions` → exit 0; `grep -n "try {" functions/src/features/userDirectory.ts` → no try/catch wrapping transactional writes remains.

### Step 2: Add `onUserDeleted`

```ts
const onUserDeleted = onDocumentDeleted(`/${RootLevelCollection.USERS}/{userId}`, async (event) => {
  const { userId } = event.params;
  await adminDb.runTransaction(async (transaction) => {
    const docs = await executeUserDirectoryQuery({
      transaction,
      queryOptions: {
        // @ts-expect-error - TypeScript doesn't recognize arbitrary keys
        orderBy: [{ fieldPath: userId, direction: 'asc' }]
      }
    });
    if (docs.length === 0) return;
    await updateUserDirectoryDoc(docs[0].page, { [userId]: FieldValue.delete() }, transaction);
  });
});
```

Export it in `userDirectoryCloudFunctions`.

**Verify**: `npx tsc --noEmit -p functions` → exit 0; confirm the new trigger is reachable from `functions/src/index.ts`'s exports (cite how).

### Step 3: Unit-test the pure capacity/branch logic

If Step 1 produced a pure decision helper (e.g. `planDirectoryWrite(pages, userId, item)` → `{ action: "create" | "update", pageId }`), unit-test it in `functions/src/features/userDirectory.test.ts`: empty directory → create page 0; last page under capacity → update last page; last page at `MAX_ENTRIES_PER_PAGE` → create next page; update for a user on page 2 of 3 → update page 2. If your refactor didn't yield a pure helper, restructure until it does — the transaction shell should be thin.

**Verify**: `npm test` → all pass.

### Step 4: Emulator smoke

`firebase emulators:start --import=./test/emulatorData`, then in the Emulator UI (port 4000): create a user doc in `/users` → a directory page gains the key; edit its `name` → directory entry updates; delete the doc → directory entry disappears. (Direct Firestore edits in the Emulator UI fire the triggers.)

**Verify**: all three lifecycle events reflected in `userDirectory` page docs; functions emulator log shows no errors.

## Test plan

Step 3 (≥4 cases on the pure helper) + Step 4 manual lifecycle smoke. Model test structure on the plan-001/003 test files.

## Done criteria

- [ ] `onUserDeleted` exists and is exported; deleting a user doc removes its directory entry (Step 4 evidence)
- [ ] No try/catch around transactional writes in `userDirectory.ts`; no reads after writes in any transaction body
- [ ] `MAX_ENTRIES_PER_PAGE` capacity logic exists and is unit-tested
- [ ] `npm test`, `npx tsc --noEmit -p functions`, `npm --prefix functions run lint` all exit 0
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The existence-filter `orderBy(userId)` query errors in the emulator (e.g. index complaints) — the page-location strategy itself would need rethinking; don't invent a replacement inline.
- Step 4 shows a trigger firing repeatedly/looping (directory writes re-triggering user triggers would indicate a path mistake — directory docs live in their own collection, so this should be impossible; if you see it, stop).
- You find an existing consumer that depends on the `page` field beyond `useUserDirectory.ts`'s delete-it behavior.

## Maintenance notes

- This plan unblocks plan 010 (restore user deletion) — without delete sync, deleted users linger in tagging dropdowns.
- The directory will drift if anyone writes `/users` docs with the Admin SDK while functions are not deployed/running (e.g. seed scripts). A backfill/rebuild script (`scripts/`-style, iterate `/users`, rebuild pages) is a deliberate non-goal here; write one if drift is observed.
- Reviewers: the subtle risk is transaction read/write ordering — verify every `transaction.get`/query precedes the first buffered write in each code path.
