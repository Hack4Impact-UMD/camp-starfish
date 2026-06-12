# Plan 004: Harden user-management callables (Zod validation, isSuperAdmin, error surfacing)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- functions/src/features/userCsvProcessing.ts functions/src/features/accountManagement.ts`
> Plan 003 intentionally rewrites part of `userCsvProcessing.ts` — that drift
> is expected; read the live file and apply this plan to it. Any *other*
> mismatch with the excerpts below is a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW — additive validation on admin-only endpoints
- **Depends on**: 003 (same file; land 003 first)
- **Category**: security
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

Three hardening gaps in the user-management Cloud Functions:

1. **The CSV callables trust their input.** Both do `JSON.parse(req.data) as SomeType` with zero runtime validation, while the repo convention (CLAUDE.md §12) is Zod at every boundary — and the sibling callable `deleteUserAccount` already follows it. A buggy or malicious admin client can write arbitrarily-shaped user docs, which then crash the readers (`fromFirestore` mappers assume well-formed docs).
2. **Admins created via CSV are missing the required `isSuperAdmin` field.** The `Admin` type requires `isSuperAdmin: boolean`, but `processEmployeeCsv` creates admin docs without it (masked by a blanket `@ts-expect-error`). The super-admin deletion guard reads this field.
3. **The super-admin deletion guard's error is swallowed.** In `deleteUserAccount`, the `failed-precondition` ("Super admin account cannot be deleted") is thrown *inside* a `try` whose catch-all rethrows "User not found." Deletion stays blocked, but the admin UI shows a wrong, confusing error.

## Current state

- `functions/src/features/userCsvProcessing.ts` — both callables parse without validation (line numbers from `0323f28`; plan 003 shifts them):

```ts
// line 17
const input = JSON.parse(req.data) as ProcessFamilyCsvRequest;
// line 76
const employees = (JSON.parse(req.data) as ProcessEmployeeCsvRequest).employees.map(...)
```

  And the employee create (lines 84–93) covers all non-photographer roles — including ADMIN — without `isSuperAdmin`:

```ts
      // @ts-expect-error - prevent extra fields from being added to Photographer type
      return createUserDoc(id, employeeDoc.role === "PHOTOGRAPHER" ? { ... } : {
        ...employeeDoc,
        dateOfBirth: Timestamp.fromDate(moment(employeeDoc.dateOfBirth).toDate()),
        nonoListIds: [],
        yesyesListIds: []
      }, transaction);
```

- `functions/src/features/accountManagement.ts:67-75` — the swallowed guard:

```ts
  let user;
  try {
    user = await getUserDocById(userId);
    if (isAdmin(user) && user.isSuperAdmin) {
      throw new HttpsError("failed-precondition", "Super admin account cannot be deleted.");
    }
  } catch {
    throw new HttpsError("not-found", "User not found.");
  }
```

- The Zod exemplar in the same repo, `accountManagement.ts:39` + `58-61`:

```ts
const UserIdSchema = z.object({ userId: z.number() });
...
  const result = UserIdSchema.safeParse(req.data);
  if (!result.success) {
    throw new HttpsError("invalid-argument", "Invalid payload: " + result.error.message);
  }
```

- Request shapes to validate against (frontend types, `src/features/userManagement/useProcessFamilyCsv.ts:6-9` and `useProcessEmployeeCsv.ts:6-8`): family = `{ campers: Pick<Camper, "id"|"name"|"parentIds"|"gender"|"dateOfBirth">[], parents: Pick<Parent, "id"|"name"|"email"|"camperIds"|"gender"|"dateOfBirth">[] }`; employee = `{ employees: Pick<Employee, "id"|"name"|"email"|"role"|"gender"|"dateOfBirth">[] }`. Note the client sends `JSON.stringify(req)` — `dateOfBirth` arrives as an ISO **string**, `name` is `{ firstName, lastName, preferredName?, middleName? }` (see `Name` in `src/types/users/userTypes.ts:18-23`), `gender` is `"Male" | "Female" | "Other"`, employee `role` is `"STAFF" | "PHOTOGRAPHER" | "ADMIN"`.
- `zod ^3.25.76` is already a dependency of both workspaces.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Functions typecheck | `npx tsc --noEmit -p functions` | exit 0 |
| Functions lint | `npm --prefix functions run lint` | exit 0 |
| Unit tests | `npm test` | all pass |
| Frontend typecheck | `npm run compile` | exit 0 |

## Scope

**In scope** (the only files you should modify/create):
- `functions/src/features/userCsvProcessing.ts`
- `functions/src/features/accountManagement.ts`
- `functions/src/features/userCsvSchemas.ts` (create — the Zod schemas, importable by tests)
- `functions/src/features/userCsvSchemas.test.ts` (create)

**Out of scope** (do NOT touch):
- The reconciliation logic from plan 003 (`userCsvReconciliation.ts`) — validation happens before it, in the handler.
- Client-side code (`src/features/userManagement/*`) — it already Zod-validates the CSV rows at parse time; this plan is the server boundary.
- `checkAllowlist` and `deleteUserAccount`'s auth/role checks — already correct.

## Git workflow

- Branch: `advisor/004-harden-user-callables`
- Commit style: `security(users): validate CSV callable payloads and fix super-admin error`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the Zod schemas

`functions/src/features/userCsvSchemas.ts`, mirroring the request shapes above. Sketch:

```ts
import { z } from "zod";

const NameSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  middleName: z.string().optional(),
});
const GenderSchema = z.enum(["Male", "Female", "Other"]);
const DateOfBirthSchema = z.string().refine(s => !Number.isNaN(Date.parse(s)), "invalid date");

export const ProcessFamilyCsvRequestSchema = z.object({
  campers: z.array(z.object({ id: z.number().int().positive(), name: NameSchema, parentIds: z.array(z.number().int()), gender: GenderSchema, dateOfBirth: DateOfBirthSchema })),
  parents: z.array(z.object({ id: z.number().int().positive(), name: NameSchema, email: z.string().email(), camperIds: z.array(z.number().int()), gender: GenderSchema, dateOfBirth: DateOfBirthSchema })),
});

export const ProcessEmployeeCsvRequestSchema = z.object({
  employees: z.array(z.object({ id: z.number().int().positive(), name: NameSchema, email: z.string().email(), role: z.enum(["STAFF", "PHOTOGRAPHER", "ADMIN"]), gender: GenderSchema, dateOfBirth: DateOfBirthSchema })),
});
```

Before finalizing, open `src/features/userManagement/useParseFamilyCsv.ts` and `useParseEmployeeCsv.ts` to confirm what the client actually sends (e.g. whether `dateOfBirth` is serialized as ISO string from a Moment — `JSON.stringify` of a Moment yields an ISO string) and whether `preferredName`/`middleName` can be present. Adjust the schemas to accept exactly what the legitimate client sends.

**Verify**: `npx tsc --noEmit -p functions` → exit 0.

### Step 2: Use the schemas in both callables

In each callable, replace the cast with parse-then-validate, following the `UserIdSchema` exemplar:

```ts
let raw: unknown;
try { raw = JSON.parse(req.data as string); }
catch { throw new HttpsError("invalid-argument", "Payload is not valid JSON"); }
const result = ProcessFamilyCsvRequestSchema.safeParse(raw);
if (!result.success) {
  throw new HttpsError("invalid-argument", "Invalid payload: " + result.error.message);
}
const input = result.data;
```

**Verify**: `npx tsc --noEmit -p functions` → exit 0; `npm --prefix functions run lint` → exit 0.

### Step 3: Set `isSuperAdmin: false` on CSV-created admins

In `processEmployeeCsv`'s create branch, split the non-photographer case so ADMIN rows get `isSuperAdmin: false` explicitly. Goal: remove the need for the blanket `@ts-expect-error` if possible (three explicit branches — PHOTOGRAPHER / STAFF / ADMIN — should typecheck against `UserDoc` without it). If a `@ts-expect-error` is still needed for the Photographer-extra-fields reason, keep it scoped to that branch only and keep the original comment.

**Verify**: `npx tsc --noEmit -p functions` → exit 0.

### Step 4: Fix the swallowed super-admin error

In `accountManagement.ts`, move the guard out of the `try` so only `getUserDocById` is caught:

```ts
let user;
try {
  user = await getUserDocById(userId);
} catch {
  throw new HttpsError("not-found", "User not found.");
}
if (isAdmin(user) && user.isSuperAdmin) {
  throw new HttpsError("failed-precondition", "Super admin account cannot be deleted.");
}
```

**Verify**: `npx tsc --noEmit -p functions` → exit 0.

### Step 5: Test the schemas

`functions/src/features/userCsvSchemas.test.ts` (pure, runs under the plan-001 Vitest config): valid family payload parses; camper with string id fails; parent without email fails; employee with role `"PARENT"` fails; ISO-string dateOfBirth accepted; garbage dateOfBirth rejected.

**Verify**: `npm test` → all pass.

## Test plan

Step 5 (≥6 schema cases). The Step-4 error-path change is covered by manual emulator verification if convenient (call `deleteUserAccount` against a seeded super-admin and confirm the message is "Super admin account cannot be deleted.") — note in your report whether you did this.

## Done criteria

- [ ] `grep -n "as ProcessFamilyCsvRequest\|as ProcessEmployeeCsvRequest" functions/src/features/userCsvProcessing.ts` → no matches
- [ ] `grep -n "isSuperAdmin" functions/src/features/userCsvProcessing.ts` → at least one match (the ADMIN create branch)
- [ ] In `accountManagement.ts`, the super-admin `HttpsError` is outside any try/catch that rethrows not-found
- [ ] `npm test` exits 0 with the new schema tests
- [ ] `npx tsc --noEmit -p functions` and `npm --prefix functions run lint` exit 0
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 003 has NOT been executed yet (check `plans/README.md`) — these plans edit the same function; report and wait rather than basing your edit on the pre-003 code.
- Step 1's read of the client parse hooks shows the wire format differs materially from the schemas sketched here (e.g. dateOfBirth serialized as epoch millis) — adjust only if unambiguous; otherwise report.
- Removing the `@ts-expect-error` in Step 3 surfaces a type error you can't resolve with the three-branch split — keep the suppression scoped and report the error text.

## Maintenance notes

- If the CSV columns change (they did in PR #247), both the client Zod schemas (`useParse*Csv.ts`) and these server schemas must change together — they are intentionally duplicated across the trust boundary.
- A future "edit user" feature should reuse `userCsvSchemas.ts` field schemas rather than inventing new ones.
- Reviewers: confirm the schemas don't *over*-reject — run the Step-4 smoke from plan 003 (re-upload a real CSV through the UI) if there's any doubt.
