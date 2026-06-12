# Plan 001: Establish a unit-test baseline with Vitest

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- package.json vitest.config.ts src/features/userManagement src/utils`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

This repo has **zero automated tests** — no runner, no config, no `*.test.*` files. The only verification gates are `tsc` and ESLint. A real production bug shipped recently that a 10-line unit test would have caught (`Object.keys()` called on an array in `functions/src/features/userCsvProcessing.ts:28`; fixed by plan 003). Plans 002, 003, 004, and 006 all want to land their fixes with tests; this plan creates the harness they depend on.

Scope is deliberately small: install Vitest, wire `npm test`, configure the path alias, and prove the harness works with tests for existing **pure** modules (CSV Zod schemas and data utilities). Emulator-based integration testing is out of scope (deferred; see Maintenance notes).

## Current state

- No test framework anywhere: `find . -name "*.test.*" -not -path "*/node_modules/*"` returns nothing. `firebase-functions-test ^3.1.0` is installed in `functions/package.json` but unused — leave it alone.
- Root `package.json` scripts (no `test` entry):

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "compile": "npx tsc --noEmit",
    "start": "next start",
    "lint": "eslint src",
    ...
  }
```

- Path alias: root `tsconfig.json` maps `@/*` → `./src/*`. **Important**: `functions/tsconfig.json` maps `@/*` → `../src/*` — which is the *same* root `src/` directory. So a single Vitest alias `@` → `<repo>/src` works for testing code from both trees.
- Good first test targets (pure, no Firebase imports):
  - `src/utils/data/partition.ts` — exports `partition<T>(items, partitionFunc)` returning `{ trueGroup, falseGroup }`.
  - `src/utils/data/groupBy.ts`, `src/utils/data/toRecord.ts` — similar small utilities.
  - `src/features/userManagement/useParseFamilyCsv.ts` — contains Zod schemas for CSV rows, e.g. (at line ~42):

```ts
const BaseFamilyCsvRecordSchema = z.object({
  "First Name": z.string().min(1),
  "Last Name": z.string().min(1),
  PersonID: z.preprocess(value => value === "" ? NaN : value, z.coerce.number()),
  ...
});
```

  Test the exported schemas/parse helpers if they are exported; if only the hook is exported, test `src/features/userManagement/csvUtils.ts` instead. Do NOT render React hooks — test only pure exports.
- The repo is npm workspaces (`functions`, `apps-script`) sharing one root `node_modules`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `npm install` | exit 0 |
| Typecheck (frontend) | `npm run compile` | exit 0 |
| Typecheck (functions) | `npx tsc --noEmit -p functions` | exit 0 |
| Lint | `npm run lint` | exit 0 (9 pre-existing warnings are OK; 0 errors) |
| Tests (after this plan) | `npm test` | all tests pass |

## Scope

**In scope** (the only files you should modify/create):
- `package.json` (root) — add `vitest` devDependency and `"test": "vitest run"` + `"test:watch": "vitest"` scripts
- `package-lock.json` (via `npm install` only)
- `vitest.config.ts` (create, repo root)
- `src/utils/data/partition.test.ts` (create)
- `src/utils/data/toRecord.test.ts` and/or `src/utils/data/groupBy.test.ts` (create at least one)
- `src/features/userManagement/csvSchemas.test.ts` or equivalent (create; co-locate next to the module under test)

**Out of scope** (do NOT touch):
- `functions/package.json` — no test script there yet; functions code gets its first tests in plan 003.
- Any production source file. If a module's pure logic isn't exported, pick a different module rather than refactoring exports in this plan.
- `firebase.json`, emulator config, CI config.
- `jest`/`firebase-functions-test` — do not wire these up.

## Git workflow

- Branch: `advisor/001-test-baseline` (branched from the current branch unless the operator says otherwise)
- Commit style (match `git log`): `tooling(tests): add vitest baseline and first unit tests`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install Vitest

`npm install --save-dev vitest` at the repo root.

**Verify**: `npx vitest --version` → prints a version, exit 0.

### Step 2: Create `vitest.config.ts` at the repo root

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "functions/src/**/*.test.ts"],
    environment: "node",
  },
});
```

The `functions/src` include is forward-looking for plan 003; it matches nothing today, which is fine.

**Verify**: `npx vitest run` → "No test files found" is acceptable at this step ONLY if it exits without a config error. (Vitest may exit 1 on zero tests — that's expected until Step 4.)

### Step 3: Add npm scripts

In root `package.json` scripts, add:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

**Verify**: `npm test -- --help` exits 0.

### Step 4: Write the first tests

1. `src/utils/data/partition.test.ts` — cases: empty array; all-true; all-false; mixed; verifies original order preserved within groups.
2. One of `toRecord.test.ts` / `groupBy.test.ts` — read the module first and cover: empty input, duplicate keys, typical case.
3. CSV schema tests — read `src/features/userManagement/useParseFamilyCsv.ts` and `csvUtils.ts`; test exported pure functions/schemas: a valid row parses; empty `PersonID` fails/NaNs per the `z.preprocess`; missing required `"First Name"` fails. Import via the `@/` alias to prove the alias config works.

Use plain `describe`/`it`/`expect` imported from `vitest`. There is no existing test to model after — these files become the exemplar; keep them simple.

**Verify**: `npm test` → all tests pass, ≥3 test files, exit 0.

### Step 5: Confirm nothing else broke

**Verify**: `npm run compile` → exit 0. `npm run lint` → 0 errors. `git status --short` → only in-scope files changed.

## Test plan

This plan *is* the test plan. Minimum bar: 3 test files, ≥10 assertions total, at least one test importing through the `@/` alias.

## Done criteria

- [ ] `npm test` exits 0 with ≥3 test files passing
- [ ] `npm run compile` exits 0
- [ ] `npm run lint` exits 0 (no new warnings beyond the 9 pre-existing)
- [ ] `vitest.config.ts` exists with the `@` alias pointing at `./src`
- [ ] No files outside the in-scope list are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm install` of vitest fails due to peer-dependency conflicts with the workspace setup (React 19 / Next 16 overrides exist in root `package.json`).
- The Zod schemas in `useParseFamilyCsv.ts` are not exported and `csvUtils.ts` has no exported pure functions either — report which exports exist instead of refactoring source files.
- `npm run compile` starts failing after adding `vitest.config.ts` (tsconfig `include` may pick it up; if so report rather than editing `tsconfig.json`).

## Maintenance notes

- Plans 002 (storage-rules tests), 003 (CSV reconciliation tests), and 006 (userDirectory) build on this harness. Plan 002 additionally introduces `@firebase/rules-unit-testing` + `firebase emulators:exec` for rules tests — keep those out of the default `npm test` run (they need emulators).
- Deferred follow-up: an emulator-backed integration test lane (`firebase emulators:exec "vitest run --dir test/integration"`), and CI wiring — there is currently no CI config in the repo at all.
- Reviewers: check that test files were co-located (`src/**/foo.test.ts` next to `foo.ts`) — that's the convention this plan establishes.
