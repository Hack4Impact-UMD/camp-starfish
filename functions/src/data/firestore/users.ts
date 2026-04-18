import { User } from "@/types/users/userTypes";
import { UserDoc } from "@/data/firestore/types/documents";
import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentReference,
  CollectionReference,
} from "firebase-admin/firestore";
import { createDoc, getDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreAdminOperations";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";

const userFirestoreConverter: FirestoreDataConverter<User, UserDoc> = {
  toFirestore: (user: WithFieldValue<User>) => {
    const { id, ...dto } = user;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<UserDoc, UserDoc>): User => ({ id: Number(snapshot.ref.id), ...snapshot.data() })
};

export async function getUserById(id: number, transaction?: Transaction): Promise<User> {
  return await getDoc<User, UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, userFirestoreConverter, transaction);
};

export async function getUserByEmail(email: string, transaction?: Transaction): Promise<User> {
  const users = await executeQuery<User, UserDoc>(adminDb.collection(RootLevelCollection.USERS) as CollectionReference<User, UserDoc>, userFirestoreConverter, {
    transaction,
    queryOptions: {
      where: [{ fieldPath: 'email', operation: '==', value: email }],
      limit: 1,
    },
  })
  if (users.length === 0) {
    throw new Error("No user with email found");
  }
  return users[0];
}

export async function createUser(id: number, user: UserDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<User, UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, { id, ...user }, userFirestoreConverter, instance);
}

export async function updateUser(id: number, updates: Partial<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<User, UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, updates, userFirestoreConverter, instance);
}

export async function deleteUser(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<User, UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<User, UserDoc>, instance);
}