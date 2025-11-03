import { Parent, ParentID } from "@/types/personTypes";
import {
  Transaction,
  WriteBatch,
  DocumentReference,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  CollectionReference,
} from "firebase-admin/firestore";
import { Collection } from "./utils";
import { setDoc, deleteDoc, executeQuery, getDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";

const parentFirestoreConverter: FirestoreDataConverter<ParentID, Parent> = {
  toFirestore: (parent: WithFieldValue<ParentID>): WithFieldValue<Parent> => {
    const { id, role, ...dto } = parent;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Parent, Parent>): ParentID => ({ id: Number(snapshot.ref.id), role: "PARENT", ...snapshot.data() }),
}

export async function getParentById(id: number, transaction?: Transaction): Promise<ParentID> {
  return await getDoc<ParentID, Parent>(adminDb.collection(Collection.PARENTS).doc(String(id)) as DocumentReference<ParentID, Parent>, parentFirestoreConverter, transaction);
}

export async function getParentByUid(uid: string): Promise<ParentID> {
  const [parent] = await executeQuery<ParentID, Parent>(adminDb.collection(Collection.PARENTS).where('uid', '==', uid).limit(1) as CollectionReference<ParentID, Parent>, parentFirestoreConverter);
  if (!parent) throw new Error('Parent not found');
  return parent;
}

export async function setParent(parent: ParentID, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<ParentID, Parent>(adminDb.collection(Collection.PARENTS).doc(String(parent.id)) as DocumentReference<ParentID, Parent>, parent, parentFirestoreConverter, instance);
};

export async function updateParent(id: number, updates: Partial<Parent>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<ParentID, Parent>(adminDb.collection(Collection.PARENTS).doc(String(id)) as DocumentReference<ParentID, Parent>, updates, parentFirestoreConverter, instance);
};

export async function deleteParent(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  return await deleteDoc<ParentID, Parent>(adminDb.collection(Collection.PARENTS).doc(String(id)) as DocumentReference<ParentID, Parent>, parentFirestoreConverter, instance);
};
