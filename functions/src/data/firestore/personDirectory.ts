import { PersonDirectoryDoc } from "@/data/firestore/types/documents";
import { DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase-admin/firestore";
import { createDoc, deleteDoc, executeAggregationQuery, ExecuteAggregationQueryOptions, executeQuery, ExecuteQueryOptions, getDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { PersonDirectory } from "@/types/sessions/sessionTypes";

function fromFirestore(snapshot: DocumentSnapshot<PersonDirectoryDoc, PersonDirectoryDoc> | QueryDocumentSnapshot<PersonDirectoryDoc, PersonDirectoryDoc>): PersonDirectory {
  if (!snapshot.exists) { throw Error("Document not found"); }
  return {
    page: Number(snapshot.id),
    ...snapshot.data()
  };
}

export async function getPersonDirectoryDoc(pageId: number, transaction?: Transaction): Promise<PersonDirectory> {
  const doc = await getDoc<PersonDirectoryDoc>(adminDb.collection(RootLevelCollection.PERSON_DIRECTORY).doc(String(pageId)), transaction);
  return fromFirestore(doc);
}

export async function executePersonDirectoryQuery(options?: ExecuteQueryOptions<PersonDirectoryDoc>): Promise<PersonDirectory[]> {
  const snapshots = await executeQuery<PersonDirectoryDoc>(adminDb.collection(RootLevelCollection.PERSON_DIRECTORY), options);
  return snapshots.map(fromFirestore);
}

export async function createPersonDirectoryDoc(pageId: number, personDirectoryDoc: PersonDirectoryDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<PersonDirectoryDoc>(adminDb.collection(RootLevelCollection.PERSON_DIRECTORY).doc(String(pageId)), personDirectoryDoc, instance);
}

export async function updatePersonDirectoryDoc(pageId: number, updates: UpdateData<PersonDirectoryDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<PersonDirectoryDoc>(adminDb.collection(RootLevelCollection.PERSON_DIRECTORY).doc(String(pageId)), updates, instance);

}

export async function deletePersonDirectoryDoc(pageId: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc(adminDb.collection(RootLevelCollection.PERSON_DIRECTORY).doc(String(pageId)), instance);
}

export async function aggregatePersonDirectoryDocs(options: ExecuteAggregationQueryOptions<PersonDirectoryDoc>): Promise<{ [key: string]: number | null }> {
  return await executeAggregationQuery(adminDb.collection(RootLevelCollection.PERSON_DIRECTORY), options);
}