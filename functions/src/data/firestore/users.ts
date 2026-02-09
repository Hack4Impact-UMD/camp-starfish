import { User } from "@/types/users/userTypes";
import { UserDoc } from "@/data/firestore/types/documents";
import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentReference,
} from "firebase-admin/firestore";
import { setDoc, getDoc, updateDoc, deleteDoc } from "./firestoreAdminOperations";
import { Collection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";

const userFirestoreConverter: FirestoreDataConverter<User, UserDoc> = {
  toFirestore: (user: WithFieldValue<User>) => {
    const { id, ...dto } = user;
    return dto as WithFieldValue<User>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<UserDoc, UserDoc>): User => ({ id: Number(snapshot.ref.id), ...snapshot.data() })
};

export async function getUserById(id: number, transaction?: Transaction): Promise<User> {
  return await getDoc<User, UserDoc>(adminDb.collection(Collection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, userFirestoreConverter, transaction);
};

export async function setUser(id: number, user: UserDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<User, UserDoc>(adminDb.collection(Collection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, { id, ...user }, userFirestoreConverter, instance);
}

export async function updateUser(id: number, updates: Partial<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<User, UserDoc>(adminDb.collection(Collection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, updates, userFirestoreConverter, instance);
}

export async function deleteUser(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<User, UserDoc>(adminDb.collection(Collection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, userFirestoreConverter, instance);
}