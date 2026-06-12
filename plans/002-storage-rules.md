# Plan 002: Replace the wide-open Storage rules with role-gated rules

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- storage.rules firebase.json src/data/storage src/hooks/albums src/hooks/albumItems src/components/UploadAlbumItemsModal`
> If any in-scope or excerpted file changed since this plan was written,
> compare the "Current state" excerpts against the live code before
> proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — wrong rules silently break parent photo downloads or photographer uploads
- **Depends on**: 001 (test harness; rules tests run under Vitest)
- **Category**: security
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

`storage.rules` currently allows **anyone on the internet** to read, overwrite, and delete every object in the bucket:

```
// storage.rules:6-12 (current, entire file body)
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

The bucket holds photos of campers — children — so this is the repo's #1 known critical issue (CLAUDE.md §11.1). Firestore rules were already locked down with role-based access (`firestore.rules`); Storage was never given the same treatment. After this plan, only authenticated users with a known role can read photos, and only staff/admin/photographers can write them.

## Current state

- `storage.rules` — wide open (excerpt above). Wired in `firebase.json` under `"storage": { "rules": "storage.rules" }`.
- Auth custom claims available in rules (set by `functions/src/features/accountManagement.ts` `checkAllowlist`): `request.auth.token.role` ∈ `"ADMIN" | "STAFF" | "PHOTOGRAPHER" | "PARENT" | "CAMPER"`, `request.auth.token.campminderId` (number), and for admins `isSuperAdmin`. Campers don't sign in in practice.
- **Every Storage path the app uses** (verified by grep across `src/` and `functions/src` — there are only two patterns):
  - `albums/{albumId}/thumbnail` — written in `src/hooks/albums/useCreateAlbum.ts:22` and `src/hooks/albums/useUpdateAlbum.ts:24` (staff/admin/photographer UI); deleted in `useUpdateAlbum.ts:26`; read via `getFileURL` in `src/hooks/albums/useAlbumThumbnailSrc.ts:6` (all roles incl. parents).
  - `albums/{albumId}/albumItems/{albumItemId}` — written in `src/hooks/albumItems/useCreateAlbumItem.ts:25` and `src/features/albums/moving/useMoveAlbumItem.ts:33-35`; read in `useAlbumItemSrc.ts:5`, `useAlbumItemBlob.ts` (parents download photos through this).
  - Cloud Functions also delete files (`functions/src/features/albums.ts:17`), but the **Admin SDK bypasses rules** — no rule needed for that.
- Album item IDs are `uuidv4()` (see `src/data/firestore/albumItems.ts:38`), i.e. unguessable object names.
- Firestore rules use this role-helper style — mirror it (from `firestore.rules:6-28`):

```
function isAuthenticated() { return request.auth != null; }
function isAdmin() { return isAuthenticated() && request.auth.token.role == "ADMIN"; }
```

- Emulators: `firebase emulators:start` ports — auth 9099, firestore 8080, storage 9199 (from `firebase.json`).

### Design decision (already made — do not redesign)

Reads are **coarse role-gated**, not per-album scoped. Fine-grained "parent sees only their camper's albums" enforcement lives in **Firestore** rules (a parent can't list album items they shouldn't see), and Storage object names are unguessable UUIDs. Cross-service `firestore.get()` calls in Storage rules were considered and rejected for v1: the parent-scope check needs 3 document reads (album → linkedSessionId, sessionAlbums → attendeeIds, users → camperIds), which exceeds the 2-call cross-service budget and adds latency to every image load. This residual risk (a signed-in parent who learns another item's UUID URL could fetch that blob) is accepted and recorded in Maintenance notes.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `npm install` | exit 0 |
| Rules tests | `npx firebase-tools emulators:exec --only storage "npx vitest run test/rules/storage.rules.test.ts"` | all tests pass |
| Frontend typecheck | `npm run compile` | exit 0 |
| Full emulator boot (manual check) | `firebase emulators:start --import=./test/emulatorData` | boots; Storage emulator loads rules without parse errors |

## Scope

**In scope** (the only files you should modify/create):
- `storage.rules`
- `test/rules/storage.rules.test.ts` (create)
- `package.json` + `package-lock.json` — add `@firebase/rules-unit-testing` devDependency only

**Out of scope** (do NOT touch):
- `firestore.rules` — already correct; not this plan.
- Any `src/` or `functions/` source file. If a client flow breaks under the new rules, that's a STOP condition, not a code-change license.
- `vitest.config.ts` `include` patterns — the rules test is run by explicit path via `emulators:exec`, NOT added to the default `npm test` run (it requires a running emulator).

## Git workflow

- Branch: `advisor/002-storage-rules`
- Commit style: `security(storage): replace wide-open storage rules with role-gated rules`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm accepted upload types

Read `src/components/UploadAlbumItemsModal/UploadAlbumItemsModal.tsx` and note what MIME types the dropzone accepts (it imports `mime-types`; look for accept lists — likely images, possibly video). The write rule's `contentType` check must accept everything the uploader legitimately sends. If the modal accepts types beyond `image/*` and `video/*`, widen the rule to match and note it in your report.

**Verify**: you can name the accepted MIME types with a file:line citation.

### Step 2: Write the new `storage.rules`

Replace the file body with:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function hasRole(role) { return isSignedIn() && request.auth.token.role == role; }
    function canManagePhotos() {
      return hasRole("ADMIN") || hasRole("STAFF") || hasRole("PHOTOGRAPHER");
    }
    // Parents read photos; fine-grained album scoping is enforced in Firestore
    // rules (see firestore.rules albumLinkedToMyCamper) + unguessable UUID paths.
    function canViewPhotos() { return canManagePhotos() || hasRole("PARENT"); }

    match /albums/{albumId}/thumbnail {
      allow read: if canViewPhotos();
      allow create, update: if canManagePhotos()
        && request.resource.size < 20 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
      allow delete: if canManagePhotos();
    }

    match /albums/{albumId}/albumItems/{albumItemId} {
      allow read: if canViewPhotos();
      allow create, update: if canManagePhotos()
        && request.resource.size < 500 * 1024 * 1024
        && request.resource.contentType.matches('image/.*|video/.*');
      allow delete: if canManagePhotos();
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Adjust the `contentType` matches per Step 1 findings. Note `create, update` (not `write`) carry the size/type checks — `request.resource` is null on delete, so a combined `write` rule would break deletes.

**Verify**: `firebase emulators:start --only storage` boots without a rules compilation error (Ctrl-C after it reports the Storage emulator is running). Look for "Rules updated" / no `Compilation error` in output.

### Step 3: Write rules tests

Create `test/rules/storage.rules.test.ts` using `@firebase/rules-unit-testing` (`npm install --save-dev @firebase/rules-unit-testing`). Pattern:

```ts
import { initializeTestEnvironment, assertSucceeds, assertFails, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { getBytes, ref, uploadBytes, deleteObject } from "firebase/storage";

let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "camp-starfish",
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });
});
afterAll(async () => { await env.cleanup(); });
```

Use `env.authenticatedContext("uid", { role: "PARENT", campminderId: 1 })`, `env.authenticatedContext("uid2", { role: "PHOTOGRAPHER", campminderId: 2 })`, and `env.unauthenticatedContext()`; get storage via `ctx.storage()`. Seed an object for read/delete tests inside `env.withSecurityRulesDisabled(async (ctx) => { ... uploadBytes ... })`. Cases (minimum):

1. unauthenticated read of `albums/a1/albumItems/i1` → fails
2. unauthenticated write → fails
3. PARENT read of `albums/a1/albumItems/i1` → succeeds
4. PARENT write of `albums/a1/albumItems/i1` → fails
5. PHOTOGRAPHER upload image to `albums/a1/albumItems/i2` (contentType `image/jpeg`) → succeeds
6. PHOTOGRAPHER upload with contentType `application/x-msdownload` → fails
7. ADMIN delete of `albums/a1/albumItems/i1` → succeeds
8. any signed-in role read/write of a path outside `/albums/**` (e.g. `random/file.txt`) → fails

**Verify**: `npx firebase-tools emulators:exec --only storage "npx vitest run test/rules/storage.rules.test.ts"` → all tests pass.

### Step 4: Manual end-to-end smoke (emulator)

Run `firebase emulators:start --import=./test/emulatorData` plus `npm run dev`, sign in as a seeded account (select an existing account in the emulator auth popup — do NOT "Add new account"), and confirm: album thumbnails render on `/albums`, an album's photos render, and (signed in as a staff/admin account) an upload via the UI succeeds.

**Verify**: photos visible, upload succeeds, no 403s in the browser network tab for `/v0/b/...` storage requests.

## Test plan

Covered by Step 3 (8 rules tests, file `test/rules/storage.rules.test.ts` — this creates the `test/rules/` pattern for future rules tests). These tests do NOT run in plain `npm test`; they require `emulators:exec` as shown.

## Done criteria

- [ ] `storage.rules` contains no `if true` (`grep "if true" storage.rules` → no matches)
- [ ] `npx firebase-tools emulators:exec --only storage "npx vitest run test/rules/storage.rules.test.ts"` exits 0, ≥8 tests
- [ ] `npm run compile` exits 0 (no source changes expected — guard check)
- [ ] Step 4 smoke passed (state which flows you exercised)
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 reveals an upload/read path in `src/` other than the two `albums/...` patterns listed in Current state — the rules would silently break it.
- Step 4 shows parents or staff getting 403s on legitimate flows and the cause isn't a typo in your rules.
- `@firebase/rules-unit-testing` is incompatible with the installed `firebase ^11` client SDK (peer conflicts at install).
- The seeded emulator accounts lack `role` custom claims (rules can't be exercised) — report; do not modify seed data.

## Maintenance notes

- **Accepted residual risk**: reads are role-gated, not album-scoped. A signed-in PARENT who obtains another album item's UUID URL can fetch that blob. If the camp later requires hard per-album isolation, revisit cross-service `firestore.get()` rules — that likely requires denormalizing `attendeeIds` onto the album doc to fit the 2-read budget.
- **Deploy is a separate operator action**: `firebase deploy --only storage` — rules in the repo do nothing for prod until deployed. Coordinate with plan 005 (Firestore indexes deploy).
- If a new Storage path is ever added (e.g. user avatars), the catch-all `if false` will block it until a rule is added — that's intentional; add a scoped match block, never widen the catch-all.
