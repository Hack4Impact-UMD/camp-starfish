# Plan 005: Define the composite Firestore indexes production needs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- firestore.indexes.json "src/app/albums/[albumId]" src/data/firestore src/hooks`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW — additive config; worst case an unused index
- **Depends on**: none
- **Category**: perf / deploy-blocker
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

`firestore.indexes.json` is empty (`{"indexes": [], "fieldOverrides": []}`), but the album page runs queries that **require composite indexes** in production Firestore: an equality filter on `inReview` combined with `orderBy` on a *different* field. The emulator auto-creates indexes, so everything works locally and fails on the first production query with `FAILED_PRECONDITION: The query requires an index`. The album page — the core parent-facing feature — would be down on launch day.

## Current state

- `firestore.indexes.json` (entire file): `{ "indexes": [], "fieldOverrides": [] }`. Wired in `firebase.json`: `"firestore": { ..., "indexes": "firestore.indexes.json" }`.
- The known composite queries, `src/app/albums/[albumId]/AlbumPage.tsx:99-110`:

```ts
  const albumItemsQuery = useAlbumItemList(album.id, {
    where: [{ fieldPath: "inReview", operation: "==", value: false }],
    ...albumItemSortOptionQueryOptions[sortOption],   // orderBy dateTaken asc|desc, or name asc|desc (lines 50-62)
    limit: 10,
    ...
  });
  const pendingItemsQuery = useAlbumItemList(album.id, {
    where: [{ fieldPath: "inReview", operation: "==", value: true }],
    limit: 1,
    ...
  });
```

  Plus `src/app/albums/[albumId]/pending/PendingPage.tsx:39` (same `inReview == true` filter; check its orderBy when you grep in Step 1).
- These run against the `albumItems` **subcollection** (`albums/{albumId}/albumItems` — see `src/data/firestore/albumItems.ts:29-35`), so the index entries use `"collectionGroup": "albumItems"` with `"queryScope": "COLLECTION"`.
- Firestore serves a query whose orderBy directions are *all* reversed by scanning the same index backwards — so ONE index `(inReview ASC, dateTaken ASC)` covers both `dateTaken asc` and `dateTaken desc`; same for `name`.
- The query builder all queries flow through is `executeQuery` in `src/data/firestore/firestoreClientOperations.ts` (client) and `functions/src/data/firestore/firestoreAdminOperations.ts:111-153` (admin).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Find all query call sites | `grep -rn "where:" src functions/src --include="*.ts*" -A 3 \| grep -B 1 "orderBy"` | list to analyze (also grep `where:` and `orderBy:` separately) |
| JSON validity | `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('ok')"` | prints `ok` |
| Emulator boot | `firebase emulators:start --only firestore` | boots, no config errors |

## Scope

**In scope** (the only file you should modify):
- `firestore.indexes.json`

**Out of scope** (do NOT touch):
- Any query code. If you find a query that could be rewritten to avoid an index, note it in your report — do not change it.
- `firestore.rules`, `firebase.json`.
- Actually deploying (`firebase deploy --only firestore:indexes`) — operator action; you likely lack prod credentials.

## Git workflow

- Branch: `advisor/005-firestore-indexes`
- Commit style: `infra(firestore): define composite indexes for album item queries`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Enumerate every where+orderBy combination in the repo

Grep both trees for query options combining `where` and `orderBy` (the shapes are `FirestoreQueryOptions` objects: `where: [{ fieldPath: ... }]`, `orderBy: [{ fieldPath: ..., direction: ... }]`):

```
grep -rn "fieldPath" src functions/src --include="*.ts*" | grep -v "__name__"
```

Then open each hit's surrounding call to record: collection (or collection group), equality fields, orderBy fields/directions. Known set as of `0323f28` (verify, don't trust): the four `AlbumPage`/`PendingPage` variants above. Queries with `where` on `__name__ in` (the `batchGetDocs` helpers) and single-field-only queries need **no** composite index. A `where x ==` combined with `orderBy x` (same field) also needs none.

**Verify**: you produce a table of (collectionGroup, filters, orderBys) in your report.

### Step 2: Write `firestore.indexes.json`

For the known queries:

```json
{
  "indexes": [
    {
      "collectionGroup": "albumItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "inReview", "order": "ASCENDING" },
        { "fieldPath": "dateTaken", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "albumItems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "inReview", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Add further entries for any additional combos found in Step 1 (one per distinct equality+orderBy set; rely on reverse scans for fully-reversed direction variants).

**Verify**: the JSON-validity command prints `ok`; `firebase emulators:start --only firestore` boots cleanly.

### Step 3: Document the deploy requirement

Add one line to the PR/commit description (and your report): indexes take effect only after `firebase deploy --only firestore:indexes`, and index builds on existing data take minutes — deploy before the album feature sees production traffic.

**Verify**: n/a (reporting step).

## Test plan

No unit tests — this is config. Verification is Step 2's JSON validity + emulator boot. The real proof (running the queries against production Firestore) is an operator action post-deploy.

## Done criteria

- [ ] `firestore.indexes.json` contains ≥2 composite indexes for `albumItems` covering `(inReview, dateTaken)` and `(inReview, name)`
- [ ] Every where+orderBy combo from the Step-1 sweep is either covered by an index or explicitly listed in your report as not needing one (with reason)
- [ ] JSON validity check prints `ok`
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 finds a query using `array-contains`, `in`, or inequality filters combined with orderBy — those have different index rules; list them in the report with your proposed index and wait for review rather than guessing.
- Step 1 turns up more than ~8 distinct combos — that suggests the query layer changed substantially since this plan was written.

## Maintenance notes

- Every future `where(...) + orderBy(...)` query needs a matching entry here **before** it ships — the emulator will not catch the omission. Suggested reviewer habit: any PR touching `FirestoreQueryOptions` call sites gets a "does firestore.indexes.json cover this?" check.
- `useParentAlbums` deliberately avoids composite indexes (fetches by id, sorts client-side) — don't "optimize" it into needing one.
- If an index deploy ever fails with "index already exists", someone created it via the console click-through link; reconcile by running `firebase firestore:indexes` (lists prod indexes) and merging into this file.
