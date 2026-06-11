import { UserDirectoryDoc } from "@/data/firestore/types/documents";
import { DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase-admin/firestore";
import { createDoc, deleteDoc, executeAggregationQuery, ExecuteAggregationQueryOptions, executeQuery, ExecuteQueryOptions, getDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { UserDirectory } from "@/types/albums/albumTypes";

function fromFirestore(snapshot: DocumentSnapshot<UserDirectoryDoc, UserDirectoryDoc> | QueryDocumentSnapshot<UserDirectoryDoc, UserDirectoryDoc>): UserDirectory {
  if (!snapshot.exists) { throw Error("Document not found"); }
  return {
    page: Number(snapshot.id),
    ...snapshot.data()
  };
}

export async function getUserDirectoryDoc(pageId: number, transaction?: Transaction): Promise<UserDirectory> {
  const doc = await getDoc<UserDirectoryDoc>(adminDb.collection(RootLevelCollection.USER_DIRECTORY).doc(String(pageId)), transaction);
  return fromFirestore(doc);
}

export async function executeUserDirectoryQuery(options?: ExecuteQueryOptions<UserDirectoryDoc>): Promise<UserDirectory[]> {
  const snapshots = await executeQuery<UserDirectoryDoc>(adminDb.collection(RootLevelCollection.USER_DIRECTORY), options);
  return snapshots.map(fromFirestore);
}

export async function createUserDirectoryDoc(pageId: number, userDirectoryDoc: UserDirectoryDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<UserDirectoryDoc>(adminDb.collection(RootLevelCollection.USER_DIRECTORY).doc(String(pageId)), userDirectoryDoc, instance);
}

export async function updateUserDirectoryDoc(pageId: number, updates: UpdateData<UserDirectoryDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<UserDirectoryDoc>(adminDb.collection(RootLevelCollection.USER_DIRECTORY).doc(String(pageId)), updates, instance);

}

export async function deleteUserDirectoryDoc(pageId: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc(adminDb.collection(RootLevelCollection.USER_DIRECTORY).doc(String(pageId)), instance);
}

export async function aggregateUserDirectoryDocs(options: ExecuteAggregationQueryOptions<UserDirectoryDoc>): Promise<{ [key: string]: number | null }> {
  return await executeAggregationQuery(adminDb.collection(RootLevelCollection.USER_DIRECTORY), options);
}