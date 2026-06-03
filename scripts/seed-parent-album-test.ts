/**
 * Seeds the Firebase emulators with a parent -> camper -> session -> album
 * chain so the parent album scoping (firestore.rules + useParentAlbums) can be
 * tested end-to-end.
 *
 * Prerequisites: the emulators must be running, e.g.
 *   firebase emulators:start --import=./test/emulatorData
 *
 * Run with:
 *   npm run seed:parent-album
 *
 * What it creates:
 *  - A PARENT auth account (with role/campminderId custom claims) you can sign
 *    in as via the emulator login popup.
 *  - A camper linked to that parent.
 *  - A session whose attendees include that camper, linked to an album (the
 *    parent SHOULD see this album).
 *  - A second session/album whose attendee is a different camper (the parent
 *    should NOT see this album) as a negative control.
 */

// Point the Admin SDK at the local emulators before initializing.
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST ?? "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "localhost:9099";

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const PROJECT_ID = "camp-starfish";

const PARENT = {
  id: 90000001,
  uid: "test-parent-uid-000001",
  email: "test.parent@campstarfish.test",
  displayName: "Test Parent",
  password: "password123",
};
const CAMPER = { id: 90000002, uid: "test-camper-uid-000002" };
const OTHER_CAMPER = { id: 90000003 };

// The emulator export ships a demo parent auth account
// (olive.otter.292@example.com, claim campminderId 12312312) whose /users doc
// is missing, which broke its albums page. Provision that doc and link it to
// the same camper so the pre-existing account is testable too.
const DEMO_PARENT = {
  id: 12312312,
  uid: "demo-parent-uid-12312312",
  email: "olive.otter.292@example.com",
};

const LINKED_SESSION_ID = "test-session-linked";
const LINKED_ALBUM_ID = "test-album-linked";
const OTHER_SESSION_ID = "test-session-other";
const OTHER_ALBUM_ID = "test-album-other";

const app = initializeApp({ projectId: PROJECT_ID });
const auth = getAuth(app);
const db = getFirestore(app);

// Session ran last month so the album sorts as a recent one.
const sessionStart = Timestamp.fromDate(new Date("2026-05-04T00:00:00.000Z"));
const sessionEnd = Timestamp.fromDate(new Date("2026-05-15T00:00:00.000Z"));

async function upsertParentAuthUser() {
  const props = {
    uid: PARENT.uid,
    email: PARENT.email,
    emailVerified: true,
    displayName: PARENT.displayName,
    password: PARENT.password,
  };
  try {
    await auth.createUser(props);
  } catch (error) {
    // Re-runnable: update if the user already exists.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "auth/uid-already-exists"
    ) {
      await auth.updateUser(PARENT.uid, props);
    } else {
      throw error;
    }
  }
  // Claims the firestore.rules and client read from request.auth.token.
  await auth.setCustomUserClaims(PARENT.uid, {
    role: "PARENT",
    campminderId: PARENT.id,
  });
}

async function seedFirestore() {
  const batch = db.batch();

  batch.set(db.doc(`users/${PARENT.id}`), {
    name: { firstName: "Test", lastName: "Parent" },
    role: "PARENT",
    gender: "Other",
    dateOfBirth: "1985-01-01T00:00:00.000Z",
    email: PARENT.email,
    uid: PARENT.uid,
    camperIds: [CAMPER.id],
  });

  // Repair the pre-existing demo parent account (olive.otter) so it resolves.
  batch.set(db.doc(`users/${DEMO_PARENT.id}`), {
    name: { firstName: "Olive", lastName: "Otter" },
    role: "PARENT",
    gender: "Other",
    dateOfBirth: "1984-01-01T00:00:00.000Z",
    email: DEMO_PARENT.email,
    uid: DEMO_PARENT.uid,
    camperIds: [CAMPER.id],
  });

  batch.set(db.doc(`users/${CAMPER.id}`), {
    name: { firstName: "Test", lastName: "Camper" },
    role: "CAMPER",
    gender: "Other",
    dateOfBirth: "2014-01-01T00:00:00.000Z",
    uid: CAMPER.uid,
    nonoListIds: [],
    parentIds: [PARENT.id, DEMO_PARENT.id],
    photoPermissions: "PUBLIC",
  });

  batch.set(db.doc(`users/${OTHER_CAMPER.id}`), {
    name: { firstName: "Other", lastName: "Camper" },
    role: "CAMPER",
    gender: "Other",
    dateOfBirth: "2013-01-01T00:00:00.000Z",
    uid: "test-other-camper-uid-000003",
    nonoListIds: [],
    parentIds: [],
    photoPermissions: "PUBLIC",
  });

  // Linked session/album: the parent's camper attends -> parent SHOULD see it.
  batch.set(db.doc(`sessions/${LINKED_SESSION_ID}`), {
    name: "Linked Test Session",
    startDate: sessionStart,
    endDate: sessionEnd,
    linkedAlbumId: LINKED_ALBUM_ID,
    driveFolderId: "",
    attendeeIds: [CAMPER.id],
  });
  batch.set(db.doc(`albums/${LINKED_ALBUM_ID}`), {
    name: "Linked Test Album",
    numItems: 2,
    startDate: sessionStart,
    endDate: sessionEnd,
    hasThumbnail: false,
    linkedSessionId: LINKED_SESSION_ID,
  });
  for (let i = 1; i <= 2; i++) {
    batch.set(db.doc(`albums/${LINKED_ALBUM_ID}/albumItems/test-item-${i}`), {
      name: `Test Photo ${i}`,
      dateTaken: sessionStart,
      inReview: false,
      tagIds: { approved: [], inReview: [] },
    });
  }

  // Other session/album: a different camper attends -> parent should NOT see it.
  batch.set(db.doc(`sessions/${OTHER_SESSION_ID}`), {
    name: "Other Session (should be hidden from the parent)",
    startDate: sessionStart,
    endDate: sessionEnd,
    linkedAlbumId: OTHER_ALBUM_ID,
    driveFolderId: "",
    attendeeIds: [OTHER_CAMPER.id],
  });
  batch.set(db.doc(`albums/${OTHER_ALBUM_ID}`), {
    name: "Other Album (should be hidden from the parent)",
    numItems: 0,
    startDate: sessionStart,
    endDate: sessionEnd,
    hasThumbnail: false,
    linkedSessionId: OTHER_SESSION_ID,
  });

  await batch.commit();
}

async function main() {
  await upsertParentAuthUser();
  await seedFirestore();

  console.log("\n✅ Seeded parent album scoping test data.\n");
  console.log("Sign in via the app's login popup and SELECT the existing account:");
  console.log(`  email:    ${PARENT.email}`);
  console.log(`  password: ${PARENT.password}  (only needed for email/password)`);
  console.log("\nExpected result on /albums as this parent:");
  console.log('  • VISIBLE:  "Linked Test Album" (2 items)');
  console.log('  • HIDDEN:   "Other Album ..." and every other unrelated album');
  console.log(
    "\nNote: select the pre-created account in the popup rather than 'Add new",
  );
  console.log(
    "account', so the PARENT claims are used (creating a new account runs the",
  );
  console.log("blocking function, which grants ADMIN in dev mode).\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed parent album test data:", error);
    process.exit(1);
  });
