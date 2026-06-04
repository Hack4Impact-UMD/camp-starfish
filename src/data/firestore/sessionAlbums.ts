import { db } from "@/config/firebase";
import { SessionAlbumDoc } from "./types/documents";
import {
  collection,
  CollectionReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { executeQuery, mapSnapshotsToPaginatedQueryResult } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";
import { SessionAlbum } from "@/types/sessions/sessionTypes";

function fromFirestore(
  snapshot:
    | DocumentSnapshot<SessionAlbumDoc, SessionAlbumDoc>
    | QueryDocumentSnapshot<SessionAlbumDoc, SessionAlbumDoc>,
): SessionAlbum {
  if (!snapshot.exists()) {
    throw Error("Document not found");
  }
  const data = snapshot.data();
  return {
    sessionId: snapshot.ref.id,
    attendeeIds: data.attendeeIds ?? [],
    linkedAlbumId: data.linkedAlbumId,
  };
}

export async function listSessionAlbumDocs(
  options: FirestoreQueryOptions<SessionAlbumDoc>,
): Promise<PaginatedQueryResponse<SessionAlbum, SessionAlbumDoc>> {
  const snapshots = await executeQuery<SessionAlbumDoc>(
    collection(db, RootLevelCollection.SESSION_ALBUMS) as CollectionReference<
      SessionAlbumDoc,
      SessionAlbumDoc
    >,
    options,
  );
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}
