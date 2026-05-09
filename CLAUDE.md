# Camp Starfish — CLAUDE.md

A comprehensive reference for working in this repository. Read this before making changes.

---

## 1. What This App Is

**Camp Starfish Photo & Scheduling App** is a web application built by **Hack4Impact-UMD** for Camp Starfish staff, photographers, parents, and administrators. It serves two primary purposes:

1. **Photo Management** — Photographers upload albums of camp photos. Parents view albums of their child's session. Admins moderate flagged photos via an album-item reporting system.
2. **Scheduling** — Camp staff/admins generate per-session schedules across multiple "section" types (BUNDLE, BUNK-JAMBO, NON-BUNK-JAMBO, COMMON), assign program areas/activities, manage night schedules, freeplays, and bunks, and export PDFs for daily use.

The app is **role-gated**: ADMIN, STAFF, PHOTOGRAPHER, PARENT, CAMPER. Different home pages render based on the authenticated user's role (driven by Firebase Auth custom claims set in a Cloud Function).

Repository: `Hack4Impact-UMD/camp-starfish`. Production target: Firebase Hosting (`us-central1`), project id `camp-starfish`.

---

## 2. Tech Stack

### Frontend (root `package.json`)
- **Framework**: Next.js `^15.5.9` (App Router, Turbopack dev)
- **React**: `^19.2.0`
- **Language**: TypeScript `^5.9.3` (target `ES2024`, `@/*` → `./src/*`)
- **UI Components**: Mantine `^8.3.18` (core, form, hooks, modals, notifications, carousel, dates, dropzone)
- **Styling**: Tailwind CSS `^4.2.1` via `@tailwindcss/postcss` + `tailwind-preset-mantine` (theme bridge)
- **Data Fetching**: TanStack Query `^5.90.6`
- **Forms**: TanStack Form `^1.27.7`
- **Tables**: TanStack Table `^8.21.3`
- **Validation**: Zod `^3.25.76`
- **Firebase Client SDK**: `firebase ^11.10.0`
- **PDF**: `@react-pdf/renderer ^4.3.1`
- **Icons**: `react-icons/md` - Material Design icons
- **Dates**: `dayjs`, `moment` (both present — see issues)
- **Other**: `uuid`, `embla-carousel-react`, `classnames`, `cookie`, `mime-types`
- **Devtools** (dev-only): `@tanstack/react-devtools`, `react-query-devtools`, `react-form-devtools`, `react-table-devtools`, `@faker-js/faker`

### Backend — Cloud Functions (`functions/package.json`)
- **Runtime**: Node.js `22`
- **Firebase Functions**: `^6.6.0` (Gen 2 / v2 triggers)
- **Firebase Admin**: `^13.5.0`
- **Google APIs**: `googleapis ^160.0.0`, `google-auth-library ^10.5.0` (Drive integration)
- **Validation**: Zod `^3.25.76`
- **Build**: `tsc && tsc-alias` (resolves `@/*` aliases at build time)
- **Lint**: `eslint-config-google` + typescript-eslint

### Google Apps Script (`apps-script/package.json`)
- **Build**: `esbuild ^0.25.6` (bundles to `dist/` as ESM, ES6 target)
- **Deploy**: `clasp push --force`
- **Purpose**: Generates Google Sheets for camper activity preferences

### Workspace
Root `package.json` declares npm workspaces: `functions`, `apps-script`. The three projects share a single `node_modules` at the root.

---

## 3. Repository Layout

```
camp-starfish/
├── apps-script/           # Google Apps Script (Drive/Sheets integration)
│   └── src/
│       ├── features/preferencesSheets/   # Preference sheet generation
│       ├── utils/properties.ts
│       ├── appsscript.json               # GAS manifest
│       └── globals.d.ts
├── docs/headshots/        # Team headshot PNGs
├── functions/             # Firebase Cloud Functions
│   └── src/
│       ├── config/firebaseAdminConfig.ts
│       ├── data/                         # Admin Firestore + Storage ops
│       ├── features/                     # Function business logic
│       ├── types/
│       ├── index.ts                      # Function exports
│       └── serverUtils.ts
├── public/                # Static assets, font files
├── scripts/
│   ├── generate-emulator-data.ts         # Faker-based seed
│   └── generate-theme-override.ts        # Mantine → Tailwind tokens
├── src/                   # Next.js frontend (see §4)
├── test/emulatorData/     # Saved emulator state (auth, firestore, storage)
├── .firebaserc            # Project: camp-starfish
├── .vscode/
├── eslint.config.ts
├── firebase.json
├── firestore.indexes.json # Currently empty
├── firestore.rules
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── storage.rules          # ⚠️ Currently wide-open (see §11)
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

---

## 4. `src/` — Frontend Detail

### `src/app/` (Next.js App Router)
| Route | File | Purpose | Auth |
|---|---|---|---|
| `/` | `page.tsx` → `LoginPage` / `EmployeeHomePage` / `ParentHomePage` | Role-routed home | none (renders by role) |
| `/albums` | `albums/page.tsx` → `AlbumsPage.tsx` | Album listing (paginated; PR #223) | ADMIN, PHOTOGRAPHER, STAFF, PARENT |
| `/albums/[albumId]` | `albums/[albumId]/page.tsx` → `AlbumPage.tsx` | Single-album view | same |
| `/sessions` | `sessions/page.tsx` | Sessions listing | STAFF/ADMIN |
| `/sessions/[sessionId]` | `SessionPage.tsx` + `SessionCalendar.tsx` | Session detail w/ calendar | STAFF/ADMIN |
| `/sessions/[sessionId]/[sectionId]` | `[sectionId]/page.tsx` | Section detail | STAFF/ADMIN |
| `/demo/program-area-grid` | `demo/program-area-grid/page.tsx` | Internal demo | none |

`layout.tsx` mounts: `Navbar`, `Footer`, custom fonts (Lato, NewSpirit, Besteam), and the `Providers` tree (Mantine, TanStack Query, Auth). Devtools are conditionally included when `NODE_ENV !== "production"`.

`loading.tsx` and `error.tsx` provide the App Router boundaries.

### `src/components/`
Reusable UI building blocks (~28 files). Highlights:
- **Layout**: `Navbar`, `Footer`, `Providers`, `BackgroundPattern`
- **Cards**: `AlbumCard`, `SessionCard`, `ImageCard`, `GalleryCardOne`, `CardGallery`
- **Activity grid**: `ActivityGrid`, `ActivityGridRow`, `ActivityGridCell`
- **Modals**: `ActivityModal`, `AssignActivityModal`, `EditSectionModal`, `FileUploadModal`, `CreateSessionModal`, `EditAlbumModal`, `ConfirmationModal`
- **Tables**: `DirectoryTableView`, `DirectoryTableCell`, `NightScheduleTable`
- **Misc**: `SortDropdown`, `LoadingAnimation`, `SectionPage`, `SmallDirectoryBlock`, `SessionsPage`

### `src/auth/`
- `AuthProvider.tsx` — Firebase Auth React context.
- `useAuth.tsx` — Hook to read the current user/role.
- `RequireAuth.tsx` — Wrapper component for role-gated pages.
- `authN.ts` — Authentication helpers.
- `googleAuthZ.ts` — Google OAuth2 (Drive) authorization flow.
- `types/clientAuthTypes.ts`

### `src/config/`
- `firebase.ts` — App init; auto-connects to emulators when running locally.
- `query.ts` — `QueryClient` with `staleTime: 2 minutes`.

### `src/data/`
Thin abstraction over Firestore and Storage. **All client reads/writes go through here** — components/hooks should not call Firebase SDK directly.
- `firestoreClientOperations.ts` — query/paginate/get/set/delete primitives.
- Per-collection modules: `albums.ts`, `albumItems.ts`, `albumItemReports.ts`, `sessions.ts`, `sections.ts`, `sectionSchedules.ts`, `attendees.ts`, `nightSchedules.ts`, `freeplays.ts`, `programAreas.ts`, `users.ts`.
- `storage/storageClientOperations.ts` — file upload/download.
- `appsScriptService.ts` — Calls into Apps Script-backed Cloud Functions.
- `types/collections.ts`, `types/documents.ts` — Collection name constants and Firestore document shapes.

### `src/features/`
Domain-specific logic (not pure UI, not pure data).
- **Scheduling/generation**: `BundleScheduler`, `BunkJamboreeScheduler`, `NonBunkJamboreeScheduler`, `SessionScheduler`, `FreeplayScheduler`.
- **Scheduling/lifecycle**: `publishSectionSchedule.ts`, `unpublishSectionSchedule.ts`.
- **Scheduling/exporting**: `DaySchedulePDF.tsx`, `CamperPreferencesSheet.tsx`, `BlockRatiosGrid.tsx`, `CamperGrid.tsx`, `EmployeeGrid.tsx`, `ProgramAreaGrid.tsx`, `DownloadDaySchedulePDFButton.tsx`.
- **Albums**: `linkAlbumAndSession.ts`, `unlinkAlbumAndSession.ts`, `albumItemReporting/useCreateAlbumItemReport.ts`, `useResolveAlbumItemReport.ts`.
- **Notifications**: `useNotifications.tsx` (Mantine notifications wrapper).

### `src/hooks/`
TanStack Query hooks per resource. Naming convention: `use<Verb><Resource>` (e.g. `useCreateSession`, `useAttendeesBySessionId`). 24+ hooks across albums, album items, sessions, sections, schedules, attendees, night schedules, program areas, freeplays.

### `src/types/`
Domain types organized by resource:
- `albums/albumTypes.ts` — `Album`, `AlbumItem`, `AlbumItemReport` (states: `PENDING`, `RESOLVED`).
- `sessions/sessionTypes.ts` — `Session`, `Section` (types: `BUNDLE`, `BUNK-JAMBO`, `NON-BUNK-JAMBO`, `COMMON`), `Attendee`, `Bunk`, `NightSchedule`, `Freeplay`, `Post`.
- `users/userTypes.ts` — `Role` enum (`CAMPER | PARENT | STAFF | PHOTOGRAPHER | ADMIN`), `User`, `Camper`, `Parent`, `Staff`, `Admin`, `Photographer`.
- `scheduling/schedulingTypes.ts` — `BundleBlock`, `JamboreeBlock`, `SectionSchedule` variants.

### `src/styles/`
- `globalTheme.ts` — Mantine theme: color palettes (`neutral`, `blue`, `orange`, `green`, `aqua`, `success`, `error`, `warning`).
- `theme.tsx` — `MantineProvider` setup.
- `theme.css` — generated CSS variables (do **not** edit by hand; run `npm run generate:theme`).
- `fonts.ts` — Lato (400–900), NewSpirit (300–600), Besteam (400).
- `components/*.ts` — Mantine component theme overrides (Button, Modal, Notification, DatePicker, ActionIcon, Image, Menu, Radio, TextInput, Text, Title, Tooltip, etc.).

### `src/utils/`
- `firebaseUtils.ts`
- `data/groupBy.ts`, `data/toRecord.ts`
- `types/typeUtils.ts`

### `src/assets/`
Logos (`darkBgLogo.png`, etc.), illustrations, background patterns.

---

## 5. `functions/src/` — Cloud Functions Detail

`index.ts` exports all v2 triggers and callable functions.

### Account Management (`features/accountManagement.ts`)
- **`checkAllowlist`** — `beforeUserCreated` blocking trigger. Sequence:
  1. Treats emails in `DEV_EMAILS` / `NPO_EMAILS` env vars as `ADMIN`.
  2. Otherwise looks the email up in Firestore user collections (`campers`, `parents`, `staff`, `admins`, `photographers`) and assigns the matching role as a custom claim.
  3. Throws `permission-denied` if no record exists.

### Albums (`features/albums.ts`)
- **`onAlbumDeleted`** — Recursive delete of album doc + thumbnail in Storage.
- **`onAlbumItemCreated`** — Updates parent album's `numItems`, `startDate`, `endDate`.
- **`onAlbumItemDeleted`** — Same housekeeping; cleans up file from Storage.

### Album Item Reporting (`features/albumItemReporting.ts`)
- **`createAlbumItemReportCloudFunction`** — Callable. Persists `{ status: PENDING, reporterId, message, reportedAt }`. Resolution flow exists in `features/albumItemReporting` on the client but no admin moderation UI route yet.

### Google Integration
- **`features/googleOAuth2.ts`** — OAuth2 token refresh and storage in `data/googleCredentials.ts`.
- **`features/googleAppsScript.ts`** — Bridge to invoke deployed Apps Script endpoints.

### Data Layer (`functions/src/data/`)
- **Firestore (admin)**: `albums.ts`, `albumItems.ts`, `albumItemReports.ts`, `sessions.ts`, `users.ts`, `googleCredentials.ts`, `firestoreAdminOperations.ts`.
- **Storage (admin)**: `storageAdminOperations.ts`.

### Build pipeline
`npm run build` = `tsc && tsc-alias` (rewrites `@/*` paths in compiled JS — required for Cloud Functions runtime).

---

## 6. `apps-script/src/` — Google Apps Script Detail

Generates and maintains Google Sheets that staff use to enter camper activity preferences.

- `features/preferencesSheets/preferencesSheets.ts`
  - `createPreferencesSpreadsheet(sessionName)` — creates a new sheet.
  - `addSectionPreferencesSheet(spreadsheetId, section)` — adds a section sheet (BUNDLE / BUNK-JAMBO / NON-BUNK-JAMBO).
  - Uses A–D color blocks (red, orange, yellow, green) for visual preference levels.
- `features/preferencesSheets/preferencesSheetsProperties.ts` — script properties.
- `features/preferencesSheets/lastModifiedFlags.ts` — tracks per-sheet modification.
- `features/preferencesSheets/triggers.ts` — installable triggers.
- `momentLib.ts` — moment.js wrapper for GAS.
- `utils/properties.ts`
- `appsscript.json` — manifest (scopes, runtime).
- `globals.d.ts` — TS declarations for the global functions exposed to Apps Script.

**Known TODO** (in `preferencesSheets.ts`): re-enable syncing Firestore updates back into the spreadsheet.

---

## 7. Styling

The app uses **Mantine UI for components and theming** with **Tailwind CSS for layout/utility styling**, kept in sync via `tailwind-preset-mantine`.

- Define design tokens (colors, fonts, radii, spacing) in `src/styles/globalTheme.ts`.
- Run `npm run generate:theme` to:
  1. Run `tailwind-preset-mantine` to emit `src/styles/theme.css`.
  2. Run `scripts/generate-theme-override.ts` to layer additional overrides.
- Component-level Mantine appearance lives in `src/styles/components/<Component>ThemeExtension.ts(x)` and is wired into the Mantine provider.
- Custom fonts (`Lato`, `NewSpirit`, `Besteam`) are loaded from `public/fonts/` via `src/styles/fonts.ts` and `next/font/local`.

When adding new UI:
1. Prefer existing Mantine components with the project's theme.
2. Use Tailwind utilities for spacing/layout, not for re-styling Mantine internals (use the theme extension files instead).
3. Reference theme tokens via Mantine props (`color="blue.6"`) or Tailwind classes that map to the generated CSS variables.

---

## 8. Authentication & Authorization

- **Firebase Auth** with custom claims (`request.auth.token.role`).
- The `checkAllowlist` Cloud Function assigns the role at user-creation time.
- Client guard: `src/auth/RequireAuth.tsx` wraps protected routes and accepts an array of allowed roles.
- Server guard: `firestore.rules` enforces `isStaff()`, `isAdmin()`, `isStaffOrAdmin()` on every collection.
- Currently `firestore.rules` is not complete. Rules need to be updated to give users with PARENT, CAMPER, and PHOTOGRAPHER roles the correct permissions.

---

## 9. Data Model (Firestore)

Top-level collections, with subcollections nested:

```
sessions/{sessionId}
  ├─ sections/{sectionId}
  │   └─ schedule/{scheduleId}
  ├─ attendees/{attendeeId}
  ├─ bunks/{bunkId}
  ├─ nightSchedules/{shiftId}
  └─ freeplays/{freeplayId}

albums/{albumId}
  └─ albumItems/{albumItemId}
    └─ albumItemReports/{reportId}

users/{userId}

programAreas/{areaId}
posts/{postId}
```

Key entities (see `src/types/` for the source of truth):
- **Session** — `name`, `startDate`, `endDate`, `linkedAlbumId`, `driveFolderId`.
- **Section** — `name`, `type`, `startDate`, `endDate`, `publishedAt`, `isScheduleOutdated`.
- **Album** — `name`, `numItems`, `startDate`, `endDate`, `hasThumbnail`, `linkedSessionId`.
- **AlbumItem** — `name`, `dateTaken`, `inReview`, `tagIds` (approved/in-review).
- **AlbumItemReport** — `status: PENDING | RESOLVED`, `reporterId`, `message`, timestamps.
- **Attendee** — discriminated union by role (`Camper`, `Staff`, `Admin`) with `ageGroup`, `bunk`, `nono`/`yesyes` lists for activity preferences.

`firestore.indexes.json` is **empty**. Composite indexes will need to be added before deploying any sorted/filtered queries that Firestore requires them for.

---

## 10. Build, Run, Test

### Local dev
```bash
# Install (root + workspaces)
npm install

# Frontend (Next.js, Turbopack)
npm run dev                    # → http://localhost:3000

# Type-check the frontend without emitting
npm run compile

# Lint
npm run lint
```

### Firebase Emulators (with seeded test data)
```bash
firebase emulators:start --import=./test/emulatorData
```
Ports (see `firebase.json`):
- Auth: `9099`
- Functions: `5001`
- Firestore: `8080`
- Hosting: `5000`
- Storage: `9199`
- Emulator UI: `4000`

### Cloud Functions
```bash
cd functions
npm run build           # tsc && tsc-alias
npm run build:watch     # rebuild on change
npm run serve           # build + start emulator (functions only)
npm run deploy          # firebase deploy --only functions
npm run logs
```

### Apps Script
```bash
cd apps-script
npm run build           # esbuild → dist/
npm run deploy          # build + clasp push --force
```

### Theme regeneration
```bash
npm run generate:theme  # after editing src/styles/globalTheme.ts
```

### Seed emulator from scratch
```bash
npx tsx scripts/generate-emulator-data.ts
```
(See `scripts/generate-emulator-data.ts` — uses `@faker-js/faker` to seed users, sessions, sections, schedules.)

### Tests
There is **no unit test framework wired up** (no Jest/Vitest config, no `.test.*` files). Validation is currently manual against the Firebase emulator. `firebase-functions-test ^3.1.0` is installed in `functions/` but no test files exist there yet.

---

## 11. Known Issues, Risks & Missing Pieces

### Critical
1. **Storage rules are wide open.** [storage.rules](storage.rules) currently has `allow read, write: if true` for all paths. **This must be replaced with role-aware rules before any production deployment.**
2. **Firestore rules vs. client gating mismatch.** `/albums` is client-gated for PARENT and PHOTOGRAPHER, but [firestore.rules](firestore.rules) only grants STAFF/ADMIN access to `albums/*`. Parents and photographers will hit permission-denied errors at runtime.
3. **`firestore.indexes.json` is empty.** Any composite-index requirement (e.g. `where(...).orderBy(...)` combinations) will fail on first query against production Firestore.

### High-priority gaps
4. **No moderation UI.** `albumItemReports` infrastructure (Cloud Function, hooks, types) exists, but there is no admin route to review/resolve pending reports.
5. **Missing routes referenced in UI.** `EmployeeHomePage` exposes "PROGRAMS" and "CAMPERS" cards, but `/programs` and `/campers` routes do not exist in `src/app/`.
6. **`SmallDirectoryBlock`** logs `"Redirect to expanded directory view"` instead of navigating — placeholder.
7. **Apps Script preference sync TODO**: `preferencesSheets.ts` has a comment to re-enable syncing Firestore updates back into the preferences spreadsheet.

### Code quality
8. **Stray `console.error` / `console.log`** statements:
   - `src/hooks/sessions/useDeleteSession.ts`
   - `src/hooks/sessions/useCreateSession.ts`
   - `src/components/SmallDirectoryBlock.tsx`
9. **Dual date libraries**: both `dayjs` and `moment` are dependencies and used in different files. Consolidating on `dayjs` would shrink bundle and reduce decision fatigue.
10. **Incomplete seed helpers**: `generateAlbum()` and `generateFamily()` in `scripts/generate-emulator-data.ts` are stubs.
11. **`tanstack: ^1.0.3`** in dependencies is suspicious — likely a typo'd install; the real packages are individually scoped (`@tanstack/*`). Verify and remove if unused.

### Documentation drift
12. README still references `tailwind.config.ts` and `eslint.config.mjs` in the structure tree, but the repo uses `eslint.config.ts` and Tailwind v4 (no `tailwind.config.ts`).
13. README's "Run Emulators with Test Data" step uses the wrong path (`./testData` vs. actual `./test/emulatorData`).

---

## 12. Conventions & Guidelines

- **Imports**: use the `@/*` alias for everything under `src/`. ESLint is configured with `import/no-unresolved` as an error.
- **Data access**: never call the Firebase SDK directly from a component. Go through `src/data/*` (raw operations) and `src/hooks/*` (TanStack Query wrappers).
- **Types**: domain types live in `src/types/<domain>/`. Document types (Firestore shapes) live in `src/data/types/documents.ts`. Keep them separate.
- **Validation**: validate at boundaries (Cloud Function inputs, callable function payloads, form submissions) with Zod.
- **No console logs in committed code** (per the README's PR checklist).
- **PRs**: link to a GitHub issue, request a tech lead review, delete the branch on merge.
- **Mantine theme overrides** belong in `src/styles/components/`, not inline `styles={{ ... }}` props on individual components.

---

## 13. Quick Reference — Where to Look

| If you need to… | Look in… |
|---|---|
| Add a page | `src/app/<route>/page.tsx` |
| Add a Firestore read/write | `src/data/<resource>.ts` + `src/hooks/<resource>/` |
| Change a domain shape | `src/types/<domain>/` and `src/data/types/documents.ts` |
| Add a Cloud Function | `functions/src/features/` and re-export in `functions/src/index.ts` |
| Tighten security rules | `firestore.rules`, `storage.rules` |
| Adjust theme | `src/styles/globalTheme.ts`, then `npm run generate:theme` |
| Restyle a Mantine component globally | `src/styles/components/<Component>ThemeExtension.ts(x)` |
| Add scheduling logic | `src/features/` (scheduler files) |
| Modify Drive/Sheets integration | `apps-script/src/` + `functions/src/features/googleAppsScript.ts` |
| Seed local data | `scripts/generate-emulator-data.ts` |

---

## 14. Team

| Name | Role | Contact |
|---|---|---|
| Nitin Kanchinadam | Tech Lead | nitin.kanchinadam@gmail.com |
| Esha Vigneswaran | Tech Lead | eshav@terpmail.umd.edu |

Project sponsored by **Hack4Impact-UMD** for **Camp Starfish**.