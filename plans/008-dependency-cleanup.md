# Plan 008: Remove dead dependencies and clear the npm audit findings

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0323f28..HEAD -- package.json functions/package.json package-lock.json`
> If the manifests changed since this plan was written, re-run the Step-1
> import greps before removing anything.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW — removals are verified-unused; the firebase-admin bump is within the same major
- **Depends on**: none (run after 001 so `npm test` exists as an extra gate, but not required)
- **Category**: deps
- **Planned at**: commit `0323f28`, 2026-06-11

## Why this matters

Three root dependencies have **zero imports anywhere** in the repo (`react-router-dom` — meaningless in a Next.js app, `lucide-react` — the app standardized on `react-icons/md`, `cookie`); they bloat installs and confuse contributors about what's idiomatic here. Separately, `npm audit` reports **10 moderate vulnerabilities**, all in the `firebase-admin` transitive chain (`gaxios`/`uuid`/`retry-request`/`teeny-request` via `google-gax`/`@google-cloud/firestore`), clearable by bumping `firebase-admin` within its `^13` range. This is hygiene, not urgency — sized accordingly.

## Current state

- Root `package.json` dependencies include: `"react-router-dom": "^7.2.0"`, `"lucide-react": "^0.482.0"`, `"cookie": "^1.1.1"`.
- Verified at `0323f28` (re-verify in Step 1): `grep -rn "react-router" src functions/src apps-script/src --include="*.ts*"` → no matches; same for `lucide-react` and `from "cookie"` / `from 'cookie'`.
- `npm audit` (run 2026-06-11): `10 moderate severity vulnerabilities`, chain rooted at `firebase-admin 12.1.1 - 13.10.0 → @google-cloud/firestore → google-gax → gaxios/retry-request/teeny-request → uuid`. `functions/package.json` pins `"firebase-admin": "^13.5.0"`.
- Also present at root: `"tsc-alias": "^1.8.16"` in **root** `dependencies`, used only by the functions build script (`functions/package.json` `"build": "tsc && tsc-alias"`, resolved via workspace hoisting). Leave it installed but **move** it to the right place (Step 3).
- Known dual date libs (`moment` + `dayjs`): `moment` is load-bearing (`User.dateOfBirth: Moment` in `src/types/users/userTypes.ts:15`, ~10 importing files in `src/` plus the functions data layer). **Consolidation is explicitly deferred — do not attempt it in this plan.**

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Import sweep | `grep -rn "<pkg>" src functions/src apps-script/src scripts --include="*.ts*"` | no matches for each removal target |
| Install | `npm install` | exit 0 |
| Audit | `npm audit` | 0 moderate+ after Step 4 (or a reported residual) |
| Typechecks | `npm run compile` && `npx tsc --noEmit -p functions` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Build smoke | `npm run build` | Next build completes |
| Tests (if 001 landed) | `npm test` | all pass |

## Scope

**In scope** (the only files you should modify):
- `package.json` (root)
- `functions/package.json` (the firebase-admin bump; receiving `tsc-alias`)
- `package-lock.json` (via `npm install` only — never hand-edit)

**Out of scope** (do NOT touch):
- Any source file. If a grep finds a real import of a "dead" package, that package is NOT dead — skip it and report.
- `moment`, `dayjs`, `react-icons` — all in use.
- `apps-script/package.json`.
- `npm audit fix --force` — never; it permits breaking semver jumps.

## Git workflow

- Branch: `advisor/008-dependency-cleanup`
- Commit style: `tooling(deps): remove unused dependencies and bump firebase-admin`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Re-verify each removal target is unimported

For each of `react-router-dom`, `lucide-react`, `cookie`: grep `src functions/src apps-script/src scripts` (include `*.ts*`, also check `*.mjs`/config files at root: `grep -rn "<pkg>" *.ts *.mjs *.json --exclude=package-lock.json` — `next.config.ts`, `postcss.config.mjs`, `eslint.config.ts`). A match in `package.json` only doesn't count.

**Verify**: zero code/config matches per package; record the grep outputs in your report.

### Step 2: Remove them

`npm uninstall react-router-dom lucide-react cookie` at the repo root.

**Verify**: `npm run compile`, `npm run build`, `npm run lint` all exit 0.

### Step 3: Relocate `tsc-alias`

Remove `tsc-alias` from root `dependencies` and add it to `functions/package.json` `devDependencies` (same version `^1.8.16`): `npm uninstall tsc-alias && npm install --save-dev --workspace functions tsc-alias`. Workspace hoisting keeps the binary available to the functions build.

**Verify**: `npm --prefix functions run build` → exit 0 (tsc + tsc-alias both run; this writes `functions/lib/`, which is gitignored — confirm with `git status --short`).

### Step 4: Clear the audit chain

`npm install --workspace functions firebase-admin@latest` **if** latest is still `13.x`; otherwise `npm update --workspace functions firebase-admin` within `^13`. Then `npm audit`.

**Verify**: `npm audit` reports 0 moderate-or-higher findings — or, if some remain because the fix requires a major bump, list the residual chain in your report and leave the manifests at the highest safe-in-range versions.

### Step 5: Full gate run

**Verify**: `npm run compile`, `npx tsc --noEmit -p functions`, `npm run lint`, `npm --prefix functions run lint`, `npm run build`, and (if present) `npm test` — all exit 0.

## Test plan

No new tests — removals of unused packages plus an in-range bump. The gates in Step 5 are the test.

## Done criteria

- [ ] `react-router-dom`, `lucide-react`, `cookie` absent from `package.json` and `package-lock.json`
- [ ] `tsc-alias` lives in `functions/package.json` devDependencies, not root dependencies; `npm --prefix functions run build` works
- [ ] `npm audit` → 0 moderate+ (or residuals documented in the report)
- [ ] All Step-5 gates exit 0
- [ ] Only the three manifest/lock files are modified (`git status --short`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 finds any real import of a removal target.
- `firebase-admin`'s latest is `14.x`+ only and `13.x` has no fixed release — a major bump needs operator sign-off (Cloud Functions runtime compatibility).
- Removing a package breaks `npm run build` with a transitive-peer error (something was depending on the hoisted copy) — restore and report.

## Maintenance notes

- **Deferred, recorded here so it isn't re-audited**: moment→dayjs consolidation (L effort; `User.dateOfBirth: Moment` makes it a domain-type migration across ~12 files plus functions). Both libs stay for now.
- `@mantine/schedule` (used by `SessionCalendar`) and `jszip`/`mime-types` were checked and are in use — not candidates.
- Reviewers: the diff should be three manifests + lockfile only.
