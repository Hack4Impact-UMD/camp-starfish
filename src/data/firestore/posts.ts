import { db } from "@/config/firebase";
import { Post } from "@/types/sessions/sessionTypes";
import { PostDoc } from "./types/documents";
import {
  doc,
  collection,
  CollectionReference,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  DocumentSnapshot,
  WithFieldValue,
  UpdateData,
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, deleteDoc, batchGetDocs, executeQuery, mapSnapshotsToPaginatedQueryResult } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<PostDoc, PostDoc> | QueryDocumentSnapshot<PostDoc, PostDoc>): Post {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const postDoc = snapshot.data();
  return {
    id: snapshot.ref.id,
    ...postDoc,
  }
}

function getPostDocumentRef(postId: string): DocumentReference<PostDoc, PostDoc> {
  return doc(db, RootLevelCollection.POSTS, postId) as DocumentReference<PostDoc, PostDoc>;
}

function getPostCollectionRef(): CollectionReference<PostDoc, PostDoc> {
  return collection(db, RootLevelCollection.POSTS) as CollectionReference<PostDoc, PostDoc> as CollectionReference<PostDoc, PostDoc>;
}

export async function getPostDoc(postId: string, transaction?: Transaction): Promise<Post> {
  const snapshot = await getDoc<PostDoc>(getPostDocumentRef(postId), transaction);
  return fromFirestore(snapshot);
};

export async function batchGetPostDocs(postIds: string[]): Promise<Post[]> {
  const snapshots = await batchGetDocs<PostDoc>(getPostCollectionRef(), postIds);
  return snapshots.map(fromFirestore);
}

export async function listPostDocs(firestoreQueryOptions: FirestoreQueryOptions<PostDoc> = {}): Promise<PaginatedQueryResponse<Post, PostDoc>> {
  const snapshots = await executeQuery<PostDoc>(getPostCollectionRef(), firestoreQueryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function setPostDoc(postId: string, Post: WithFieldValue<PostDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<PostDoc>(getPostDocumentRef(postId), Post, { instance });
}

export async function updatePostDoc(postId: string, updates: UpdateData<PostDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<PostDoc>(getPostDocumentRef(postId), updates, instance);
}

export async function deletePostDoc(postId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<PostDoc>(getPostDocumentRef(postId), instance);
}