import { collection, CollectionReference, DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { UserDirectoryDoc } from "./types/documents";
import { db } from "@/config/firebase";
import { FirestoreQueryOptions } from "./types/queries";
import { UserDirectory } from "@/types/albums/albumTypes";

function fromFirestore(snapshot: DocumentSnapshot<UserDirectoryDoc, UserDirectoryDoc> | QueryDocumentSnapshot<UserDirectoryDoc, UserDirectoryDoc>): UserDirectory {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    page: Number(snapshot.id),
    ...snapshot.data()
  };
}

export async function executeUserDirectoryQuery(options?: FirestoreQueryOptions<UserDirectoryDoc>): Promise<UserDirectory[]> {
  const snapshots = await executeQuery<UserDirectoryDoc>(collection(db, RootLevelCollection.USER_DIRECTORY) as CollectionReference<UserDirectoryDoc, UserDirectoryDoc>, options);
  return snapshots.map(fromFirestore);
}