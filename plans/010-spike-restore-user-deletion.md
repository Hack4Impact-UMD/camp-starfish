# Plan 010: Spike — restore the user-deletion action in the admin Users page

> **Executor instructions**: This is a **design/spike plan**, not a build
> plan. The deliverable is a short written design (committed as
> `plans/010-spike-OUTCOME.md`) plus, only if every open question resolves
> cleanly, the small code change itself. Follow the steps; honor the STOP
> conditions; update the status row in `plans/README.md` when done — unless
> a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- src/app/users/UsersPage.tsx functions/src/features/accountManagement.ts src/hooks/users/useDeleteUser.ts functions/src/features/userDirectory.ts`
> Expected drift: plans 004 and 006 modify two of these files — read the live
> versions. Unexpected drift in `UsersPage.tsx` (e.g. the column was already
> restored) is a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S (spike) — implementation likely S too, but that's the spike's question
- **Risk**: LOW for the spike; the feature itself is MED (irreversible destructive action)
- **Depends on**: 004 (correct error surfacing), 006 (directory delete sync). Do not run before both are DONE.
- **Category**: direction
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

The Users page shipped with a delete action, then PR #251 ("temp(users): hide column to delete a user") commented it out — explicitly temporary. The entire backend already exists and is guarded: the `deleteUserAccount` callable checks ADMIN role, blocks self-deletion, blocks super-admin deletion, deletes the Auth account before the Firestore doc. What's missing is the product-level answers for why it was pulled, and the data-consistency edges around deletion. This spike answers those and restores the column if nothing blocks.

## Current state

- The commented-out column, `src/app/users/UsersPage.tsx:129-155` — a fully-written `ColumnDef` rendering a delete `ActionIcon` with self-deletion disabled and an `openConfirmationModal` wrapper:

```ts
      // {
      //   id: "actions",
      //   header: "ACTIONS",
      //   cell: (info) => {
      //     const user = info.row.original;
      //     const isSelf = currentUserId !== undefined && currentUserId === user.id;
      //     return (
      //       <ActionIcon ... disabled={isSelf}
      //         onClick={() => openConfirmationModal({
      //             title: `Delete User "${getFullName(user.name)}"?`,
      //             onConfirm: () => deleteUserById({ userId: user.id }),
      //         })} > <MdDelete size={18} /> </ActionIcon>
      //     );
      //   },
      //   enableSorting: false,
      // },
```

  The imports it needs (`MdDelete`, `ActionIcon`, `openConfirmationModal`, `useDeleteUser`, `getFullName`) are all still imported and partially unused at `0323f28`.
- The callable: `functions/src/features/accountManagement.ts:53-95` (`deleteUserAccount`). Client hook: `src/hooks/users/useDeleteUser.ts` (mutation + query invalidation + success/error notifications — complete).
- Known consistency gaps around deletion (the likely reasons it was pulled):
  - **`userDirectory` orphans** — fixed by plan 006 (`onUserDeleted`).
  - **Family-link orphans** — deleting a camper leaves its id in parents' `camperIds`; deleting a parent leaves `parentIds` on campers. Nothing cleans these. Firestore rules' `myCamperIds()` would still grant a parent read access scoped to a deleted camper id (harmless for reads, but it's dangling data).
  - **Session-attendee orphans** — `sessions/{id}/attendees` docs and `attendeeIds` arrays may reference the deleted user.
  - **Token lifetime** — deleting the Auth account does not invalidate an already-issued ID token (~1 h validity). Firestore rules keyed on claims keep working until expiry.
- Git context: `git log --oneline` around `bbfb315` (#251), `69b6b83` (#249, super-admin guard), `78d1faf` (#248, isSuperAdmin field) — read the PR descriptions if `gh` is available (`gh pr view 251`) for the stated reason the column was hidden.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| PR archaeology | `gh pr view 251 --comments` (also 249, 250) | stated reason, if any |
| Frontend typecheck | `npm run compile` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Emulator run | `firebase emulators:start --import=./test/emulatorData` + `npm run dev` | manual delete flow testable |

## Scope

**In scope**:
- `plans/010-spike-OUTCOME.md` (create — the design write-up; ~1 page)
- `src/app/users/UsersPage.tsx` (ONLY if the Decision Gate below passes)

**Out of scope** (do NOT touch, regardless of findings):
- `functions/src/features/accountManagement.ts` — cascade-deletion logic (family links, attendees) is a *recommendation* in the write-up, not something to build in this spike.
- Bulk deletion, audit logging, soft-delete — design options to discuss only.
- `firestore.rules`.

## Git workflow

- Branch: `advisor/010-restore-user-deletion`
- Commit style: `feat(users): restore user deletion column` (only if the gate passes; the write-up commits as `docs(plans): user-deletion spike outcome`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Archaeology

Read PRs #249–#251 (via `gh` or the GitHub UI dump in commit messages). Record: the stated reason the column was hidden, and any conditions named for restoring it.

### Step 2: Verify the dependency plans landed

Check `plans/README.md`: 004 (super-admin error surfaces correctly) and 006 (`onUserDeleted` directory sync) must be DONE. Spot-verify in code: `grep -n "onUserDeleted" functions/src/features/userDirectory.ts` → present; the super-admin guard in `accountManagement.ts` is outside the not-found catch.

### Step 3: Answer the open questions (the spike's core)

Write `plans/010-spike-OUTCOME.md` answering, with code citations:

1. Why was the column hidden (Step 1 evidence), and does that reason still hold?
2. What orphaned data does deleting each role leave today (camper / parent / staff / admin / photographer)? Enumerate concretely by grepping for the id-list fields (`camperIds`, `parentIds`, `attendeeIds`, `nonoListIds`, `yesyesListIds`).
3. Is orphaned data acceptable for v1? Recommendation with rationale (suggested: acceptable for employee roles; camper/parent deletion should warn the admin in the confirmation modal about family-link orphans, with cascade cleanup as a listed follow-up).
4. Token-lifetime risk statement: deleted user's ID token works ≤1 h; is that acceptable? (Industry-normal for Firebase; say so explicitly, and note `adminAuth.revokeRefreshTokens` exists if not.)
5. UX: per-row delete only, or should this wait for bulk selection? (Recommend per-row now; the page has no row selection.)

### Step 4: Decision Gate

Restore the column ONLY if ALL hold: (a) Step 1 found no unresolved product objection, (b) Step 2 dependencies are DONE, (c) your Step 3 answers recommend proceeding. Otherwise the spike ends with the write-up and a BLOCKED/recommendation status.

### Step 5 (gate passed): Restore the column

Uncomment `UsersPage.tsx:129-155`, adjust to the live file (plan 004+ may have shifted lines), extend the confirmation modal copy per Step 3.3 (e.g. warn on CAMPER/PARENT deletions). Manual emulator test: delete a seeded non-admin user as an admin → row disappears, notification shows; attempt self-delete → button disabled; delete a super-admin → error notification reads "Super admin account cannot be deleted."

**Verify**: `npm run compile` exit 0; `npm run lint` exit 0 (restoring the column also un-deadens the currently-unused imports); the three manual cases above behave as stated.

## Test plan

Spike write-up requires no tests. If Step 5 executes: the three manual emulator cases above, recorded in the write-up. (Component tests for the table are out of scope — no React testing harness exists.)

## Done criteria

- [ ] `plans/010-spike-OUTCOME.md` exists, answers all five questions with citations
- [ ] Decision Gate outcome recorded (proceed / blocked-with-reason)
- [ ] If proceeded: column restored, three manual cases verified, `npm run compile` + `npm run lint` exit 0
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated (DONE or BLOCKED with the gate reason)

## STOP conditions

Stop and report back (do not improvise) if:

- The column is already restored in the live `UsersPage.tsx` (someone did it independently) — write up Step 3 anyway as a review, touch nothing.
- Step 1 reveals a product/policy reason (e.g. "wait for soft-delete") — the gate fails; finish the write-up as the deliverable.
- Plans 004 or 006 are not DONE — the gate fails; do not restore the column on top of the broken error-surfacing/orphaning behavior.

## Maintenance notes

- The natural follow-ups this spike should enumerate (not build): cascade cleanup of family links (extend `deleteUserAccount`), session-attendee cleanup, bulk delete with the CardGallery selection pattern used on `/sessions`, and an audit log of admin deletions.
- Other direction options the maintainer chose not to plan this round (recorded so they aren't lost): build-or-unlink `/campers` (Navbar.tsx:28 404s today), an admin moderation route for `albumItemReports`, and role-change→claims sync (`onDocumentUpdated` on `/users`, the `userDirectory.ts` trigger is the pattern).
