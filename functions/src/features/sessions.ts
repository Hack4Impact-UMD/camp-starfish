import { RootLevelCollection } from "@/data/firestore/types/collections";
import { SessionAlbumDoc, SessionDoc } from "@/data/firestore/types/documents";
import { onDocumentDeleted, onDocumentWritten } from "firebase-functions/firestore";
import { adminDb } from "../config/firebaseAdminConfig";

// Cascade-delete a session's subcollections (sections + their schedules,
// attendees, bunks, nightSchedules, freeplays) and its album-link projection
// when the session document is deleted. Firestore does not remove
// subcollections automatically.
const onSessionDeleted = onDocumentDeleted(
  `/${RootLevelCollection.SESSIONS}/{sessionId}`,
  async (event) => {
    const { sessionId } = event.params;
    await Promise.all([
      adminDb.recursiveDelete(
        adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId),
      ),
      adminDb
        .collection(RootLevelCollection.SESSION_ALBUMS)
        .doc(sessionId)
        .delete(),
    ]);
  },
);

// Mirror the session's album linkage into the parent-readable `sessionAlbums`
// projection so parents can resolve their album without reading full sessions.
const mirrorSessionAlbumLink = onDocumentWritten(
  `/${RootLevelCollection.SESSIONS}/{sessionId}`,
  async (event) => {
    const { sessionId } = event.params;
    const after = event.data?.after.data() as SessionDoc | undefined;
    // Deletes are handled by onSessionDeleted; only mirror create/update here.
    if (!after) return;

    const projection: SessionAlbumDoc = {
      attendeeIds: after.attendeeIds ?? [],
      ...(after.linkedAlbumId ? { linkedAlbumId: after.linkedAlbumId } : {}),
    };
    await adminDb
      .collection(RootLevelCollection.SESSION_ALBUMS)
      .doc(sessionId)
      .set(projection);
  },
);

export const sessionsCloudFunctions = {
  onSessionDeleted,
  mirrorSessionAlbumLink,
};
