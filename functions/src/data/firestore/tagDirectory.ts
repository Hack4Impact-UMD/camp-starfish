import { TagDirectoryDoc } from "@/data/firestore/types/documents";
import { DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase-admin/firestore";
import { createDoc, deleteDoc, executeAggregationQuery, ExecuteAggregationQueryOptions, executeQuery, ExecuteQueryOptions, getDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { TagDirectory } from "@/types/albums/albumTypes";

function fromFirestore(snapshot: DocumentSnapshot<TagDirectoryDoc, TagDirectoryDoc> | QueryDocumentSnapshot<TagDirectoryDoc, TagDirectoryDoc>): TagDirectory {
  if (!snapshot.exists) { throw Error("Document not found"); }
    return {
    page: Number(snapshot.id),
    ...snapshot.data()
  };
}

export async function getTagDirectoryDoc(pageId: number, transaction?: Transaction): Promise<TagDirectory> {
  const doc = await getDoc<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(String(pageId)), transaction);
  return fromFirestore(doc);
}

export async function executeTagDirectoryQuery(options?: ExecuteQueryOptions<TagDirectoryDoc>): Promise<TagDirectory[]> {
  const snapshots = await executeQuery<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY), options);
  return snapshots.map(fromFirestore);
}

export async function createTagDirectoryDoc(pageId: number, tagDirectoryDoc: TagDirectoryDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(String(pageId)), tagDirectoryDoc, instance);
}

export async function updateTagDirectoryDoc(pageId: number, updates: UpdateData<TagDirectoryDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(String(pageId)), updates, instance);
  
}

export async function deleteTagDirectoryDoc(pageId: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(String(pageId)), instance);
}

export async function aggregateTagDirectoryDocs(options: ExecuteAggregationQueryOptions<TagDirectoryDoc>): Promise<{ [key: string]: number | null }> {
  return await executeAggregationQuery(adminDb.collection(RootLevelCollection.TAG_DIRECTORY), options);
}