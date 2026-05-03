import { TagDirectoryDoc } from "@/data/firestore/types/documents";
import { DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase-admin/firestore";
import { createDoc, deleteDoc, executeQuery, ExecuteQueryOptions, updateDoc } from "./firestoreAdminOperations";
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

export async function getTagDirectoryDoc(pageId: number, transaction?: Transaction): Promise<TagDirectoryDoc> {
  const doc = await getDoc<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(String(pageId)), transaction);
  return fromFirestore(doc);
}

export async function executeTagDirectoryQuery(options?: ExecuteQueryOptions<TagDirectoryDoc>): Promise<TagDirectoryDoc[]> {
  const snapshots = await executeQuery<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY), options);
  return snapshots.map(fromFirestore);
}

export async function createTagDirectoryDoc(tagDirectoryDoc: TagDirectoryDoc, instance?: Transaction | WriteBatch): Promise<void> {
  const pageId = uuidv4();
  await createDoc<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(pageId), tagDirectoryDoc, instance);
}

export async function updateTagDirectoryDoc(pageId: string, updates: UpdateData<TagDirectoryDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<TagDirectoryDoc>(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(pageId), updates, instance);
}

export async function deleteTagDirectoryDoc(pageId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc(adminDb.collection(RootLevelCollection.TAG_DIRECTORY).doc(pageId));
}