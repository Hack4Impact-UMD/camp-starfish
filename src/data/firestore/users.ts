import { db } from "@/config/firebase";
import { User } from "@/types/users/userTypes";
import { UserDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  DocumentSnapshot,
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, deleteDoc } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";

function fromFirestore(snapshot: DocumentSnapshot<UserDoc, UserDoc> | QueryDocumentSnapshot<UserDoc, UserDoc>): User {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: Number(snapshot.ref.id),
    ...snapshot.data()
  }
}

export async function getUserById(id: number, transaction?: Transaction): Promise<User> {
  const snapshot = await getDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function createUser(id: number, user: UserDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, user, { instance });
}

export async function updateUser(id: number, updates: Partial<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, updates, instance);
}

export async function deleteUser(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<UserDoc>(doc(db, RootLevelCollection.USERS, String(id)) as DocumentReference<UserDoc, UserDoc>, instance);
}