import { db } from "@/config/firebase";
import { User } from "@/types/users/userTypes";
import { UserDoc } from "./types/documents";
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
import { setDoc, getDoc, updateDoc, deleteDoc, batchGetDocs, executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { FirestoreQueryOptions } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<UserDoc, UserDoc> | QueryDocumentSnapshot<UserDoc, UserDoc>): User {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: Number(snapshot.ref.id),
    ...snapshot.data()
  }
}

export async function getUserDoc(id: number, transaction?: Transaction): Promise<User> {
  const snapshot = await getDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function batchGetUserDocs(ids: number[]): Promise<User[]> {
  const snapshots = await batchGetDocs<UserDoc>(collection(db, RootLevelCollection.USERS) as CollectionReference<UserDoc, UserDoc>, ids.map(id => String(id)));
  return snapshots.map(fromFirestore);
}

export async function listUserDocs(firestoreQueryOptions: FirestoreQueryOptions<UserDoc> = {}): Promise<User[]> {
  const snapshots = await executeQuery<UserDoc>(collection(db, RootLevelCollection.USERS) as CollectionReference<UserDoc, UserDoc>, firestoreQueryOptions);
  return snapshots.map(fromFirestore);
}

export async function createUserDoc(id: number, user: WithFieldValue<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, user, { instance });
}

export async function updateUserDoc(id: number, updates: UpdateData<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, updates, instance);
}

export async function deleteUserDoc(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, instance);
}