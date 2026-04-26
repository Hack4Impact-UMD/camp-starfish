import { User } from "@/types/users/userTypes";
import { UserDoc } from "@/data/firestore/types/documents";
import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  UpdateData,
  WithFieldValue,
} from "firebase-admin/firestore";
import { createDoc, getDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreAdminOperations";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";

function fromFirestore(snapshot: DocumentSnapshot<UserDoc, UserDoc> | QueryDocumentSnapshot<UserDoc, UserDoc>): User {
  if (!snapshot.exists) { throw Error("Document not found"); };
  return {
    id: Number(snapshot.ref.id),
    ...snapshot.data() as UserDoc
  }
}

export async function getUserById(id: number, transaction?: Transaction): Promise<User> {
  const snapshot = await getDoc<UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<UserDoc, UserDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function getUserByEmail(email: string, transaction?: Transaction): Promise<User> {
  const snapshots = await executeQuery<UserDoc>(adminDb.collection(RootLevelCollection.USERS) as CollectionReference<UserDoc, UserDoc>, {
    transaction,
    queryOptions: {
      where: [{ fieldPath: 'email', operation: '==', value: email }],
      limit: 1,
    },
  })
  if (snapshots.length === 0) {
    throw new Error("No user with email found");
  }
  return fromFirestore(snapshots[0]);
}

export async function createUser(id: number, user: WithFieldValue<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<UserDoc, UserDoc>, user, instance);
}

export async function updateUser(id: number, updates: UpdateData<UserDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<UserDoc, UserDoc>, updates, instance);
}

export async function deleteUser(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<UserDoc>(adminDb.collection(RootLevelCollection.USERS).doc(String(id)) as DocumentReference<UserDoc, UserDoc>, instance);
}