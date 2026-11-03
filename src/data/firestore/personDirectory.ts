import { collection, CollectionReference, DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import { executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { PersonDirectoryDoc } from "./types/documents";
import { db } from "@/config/firebase";
import { FirestoreQueryOptions } from "./types/queries";
import { PersonDirectory } from "@/types/sessions/sessionTypes";

function fromFirestore(snapshot: DocumentSnapshot<PersonDirectoryDoc, PersonDirectoryDoc> | QueryDocumentSnapshot<PersonDirectoryDoc, PersonDirectoryDoc>): PersonDirectory {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    page: Number(snapshot.id),
    ...snapshot.data()
  };
}

export async function executePersonDirectoryQuery(options?: FirestoreQueryOptions<PersonDirectoryDoc>): Promise<PersonDirectory[]> {
  const snapshots = await executeQuery<PersonDirectoryDoc>(collection(db, RootLevelCollection.PERSON_DIRECTORY) as CollectionReference<PersonDirectoryDoc, PersonDirectoryDoc>, options);
  return snapshots.map(fromFirestore);
}