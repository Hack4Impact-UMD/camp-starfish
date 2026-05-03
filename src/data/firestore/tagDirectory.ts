import { collection, CollectionReference, DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { TagDirectoryDoc } from "./types/documents";
import { db } from "@/config/firebase";
import { FirestoreQueryOptions } from "./types/queries";
import { TagDirectory } from "@/types/albums/albumTypes";

function fromFirestore(snapshot: DocumentSnapshot<TagDirectoryDoc, TagDirectoryDoc> | QueryDocumentSnapshot<TagDirectoryDoc, TagDirectoryDoc>): TagDirectory {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    page: Number(snapshot.id),
    ...snapshot.data()
  };
}

export async function executeTagDirectoryQuery(options?: FirestoreQueryOptions<TagDirectoryDoc>): Promise<TagDirectoryDoc[]> {
  const snapshots = await executeQuery<TagDirectoryDoc>(collection(db, RootLevelCollection.TAG_DIRECTORY) as CollectionReference<TagDirectoryDoc, TagDirectoryDoc>, options);
  return snapshots.map(fromFirestore);
}