/**
 * One-time backfill for the `sessionAlbums` projection.
 *
 * `mirrorSessionAlbumLink` only mirrors sessions written after it's deployed, so
 * existing sessions have no projection (and parents can't resolve their album).
 * This scans every session and writes/overwrites its projection. It is
 * idempotent — re-running it is safe and won't duplicate or corrupt data.
 *
 * Run against a target by setting the usual Admin SDK env:
 *   # emulator
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/backfill-session-albums.ts
 *   # production (with application-default / service-account credentials)
 *   GCLOUD_PROJECT=camp-starfish npx tsx scripts/backfill-session-albums.ts
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.GCLOUD_PROJECT ?? "camp-starfish";

const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);

async function main() {
  const sessions = await db.collection("sessions").get();
  console.log(`Found ${sessions.size} session(s).`);

  let written = 0;
  let failed = 0;
  for (const doc of sessions.docs) {
    const data = doc.data();
    const projection = {
      attendeeIds: data.attendeeIds ?? [],
      ...(data.linkedAlbumId ? { linkedAlbumId: data.linkedAlbumId } : {}),
    };
    try {
      await db.collection("sessionAlbums").doc(doc.id).set(projection);
      written++;
    } catch (error) {
      failed++;
      console.error(`  ✗ ${doc.id}`, error);
    }
  }

  console.log(`\nBackfilled ${written} sessionAlbums (${failed} failed).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });
