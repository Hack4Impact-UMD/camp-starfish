import { db } from "@/config/firebase";
import { Post } from "@/types/sessions/sessionTypes";
import { PostDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  collection,
  UpdateData,
  CollectionReference,
  DocumentSnapshot,
  WithFieldValue
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, deleteDoc, batchGetDocs, executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";

function fromFirestore(snapshot: DocumentSnapshot<PostDoc, PostDoc> | QueryDocumentSnapshot<PostDoc, PostDoc>): Post {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: snapshot.ref.id,
    ...snapshot.data()
  }
}

export async function getPostDoc(id: string, transaction?: Transaction): Promise<Post> {
  const snapshot = await getDoc<PostDoc>(doc(db, RootLevelCollection.POSTS, id) as DocumentReference<PostDoc, PostDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function batchGetPostDocs(ids: string[]): Promise<Post[]> {
  const snapshots = await batchGetDocs<PostDoc>(collection(db, RootLevelCollection.POSTS) as CollectionReference<PostDoc, PostDoc>, ids);
  return snapshots.map(fromFirestore);
}

export async function listPostDocs(): Promise<Post[]> {
  const snapshots = await executeQuery<PostDoc>(collection(db, RootLevelCollection.POSTS) as CollectionReference<PostDoc, PostDoc>, {});
  return snapshots.map(fromFirestore);
}

export async function createPostDoc(id: string, post: WithFieldValue<PostDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<PostDoc>(doc(db, RootLevelCollection.POSTS, id) as DocumentReference<PostDoc, PostDoc>, post, { instance });
}

export async function updatePostDoc(id: string, updates: UpdateData<PostDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<PostDoc>(doc(db, RootLevelCollection.POSTS, id) as DocumentReference<PostDoc, PostDoc>, updates, instance);
}

export async function deletePostDoc(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<PostDoc>(doc(db, RootLevelCollection.POSTS, id) as DocumentReference<PostDoc, PostDoc>, instance);
}
