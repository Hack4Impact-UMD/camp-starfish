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
  FirestoreDataConverter,
  WithFieldValue,
  DocumentReference,
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreClientOperations";
import { Collection } from "./types/collections";

const userFirestoreConverter: FirestoreDataConverter<User, UserDoc> = {
  toFirestore: (user: WithFieldValue<User>) => {
    const { id, ...dto } = user;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<UserDoc, UserDoc>): User => ({ id: Number(snapshot.ref.id), ...snapshot.data() })
};

export async function getAllUsers(): Promise<User[]> {
  return await executeQuery<User, UserDoc>(collection(db, Collection.USERS) as CollectionReference<User, UserDoc>, userFirestoreConverter);
}

export async function getUserById(id: number, transaction?: Transaction): Promise<User> {
  return await getDoc<User, UserDoc>(doc(db, Collection.USERS, String(id)) as DocumentReference<User, UserDoc>, userFirestoreConverter, transaction);
};

export async function setUser(id: number, user: UserDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<User, UserDoc>(doc(db, Collection.USERS, String(id)) as DocumentReference<User, UserDoc>, { id, ...user }, userFirestoreConverter, instance);
}

export async function updateUser(id: number, updates: Partial<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<User, UserDoc>(doc(db, Collection.USERS, String(id)) as DocumentReference<User, UserDoc>, updates, userFirestoreConverter, instance);
}

export async function deleteUser(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<User, UserDoc>(doc(db, Collection.USERS, String(id)) as DocumentReference<User, UserDoc>, userFirestoreConverter, instance);
}