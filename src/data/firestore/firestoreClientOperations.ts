import { FirebaseError } from "firebase/app";
import { DocumentReference, Query, Transaction, WriteBatch, DocumentSnapshot, getDoc as getFirestore, setDoc as setFirestore, updateDoc as updateFirestore, deleteDoc as deleteFirestore, getDocs as queryFirestore, WithFieldValue, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export async function getDoc<T>(ref: DocumentReference, transaction?: Transaction): Promise<DocumentSnapshot<T>> {
  let doc: DocumentSnapshot<T>;
  try {
    doc = await (transaction ? transaction.get(ref) : getFirestore(ref)) as DocumentSnapshot<T>;
  } catch {
    throw Error("Error getting document");
  }

  if (!doc.exists()) {
    throw Error("Document not found");
  }
  return doc;
}

export async function createDoc<T extends WithFieldValue<DocumentData>>(ref: DocumentReference, data: T, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    // @ts-expect-error
    await (instance ? instance.set(ref, data) : setFirestore(ref, data));
  } catch (error) {
    throw Error("Failed to create document");
  }
}

export async function updateDoc<T>(ref: DocumentReference, data: Partial<WithFieldValue<T>>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    // @ts-expect-error
    await (instance ? instance.update(ref, data) : updateFirestore(ref, data));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "not-found") {
      throw Error("Attempted to update a document that doesn't exist");
    }
    throw Error("Failed to update document");
  }
}

export async function deleteDoc(ref: DocumentReference, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    // @ts-expect-error
    await (instance ? instance.delete(ref, data) : deleteFirestore(ref, data));
  } catch {
    throw Error("Failed to delete document");
  }}

export async function executeQuery<T>(query: Query): Promise<QueryDocumentSnapshot<T>[]> {
  try {
    const querySnapshot = await queryFirestore(query);
    return querySnapshot.docs as QueryDocumentSnapshot<T>[];
  } catch {
    throw Error("Failed to execute query");
  }
}