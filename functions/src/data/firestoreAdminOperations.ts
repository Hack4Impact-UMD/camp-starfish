import { DocumentData, DocumentReference, DocumentSnapshot, GrpcStatus, Query, QueryDocumentSnapshot, Transaction, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { isFirebaseError } from "../types/error";

export async function getDoc<T>(ref: DocumentReference, transaction?: Transaction): Promise<DocumentSnapshot<T>> {
  let doc: DocumentSnapshot<T>;
  try {
    doc = await (transaction ? transaction.get(ref) : ref.get()) as DocumentSnapshot<T>;
  } catch {
    throw Error("Error getting document");
  }

  if (!doc.exists) {
    throw Error("Document not found");
  }
  return doc;
}

export async function createDoc<T extends WithFieldValue<DocumentData>>(ref: DocumentReference, data: T, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.create(ref, data) : ref.create(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.ALREADY_EXISTS) {
      throw Error("Document already exists");
    }
    throw Error("Failed to create document");
  }
}

export async function updateDoc<T>(ref: DocumentReference, data: Partial<WithFieldValue<T>>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    // @ts-expect-error
    await (instance ? instance.update(ref, data) : ref.update(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.NOT_FOUND) {
      throw Error("Can't update a document that doesn't exist");
    }
    throw Error("Failed to update document");
  }
}

export async function deleteDoc(ref: DocumentReference, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.delete(ref) : ref.delete());
  } catch {
    throw Error("Failed to delete document");
  }
}

export async function executeQuery<T>(query: Query, instance?: Transaction): Promise<QueryDocumentSnapshot<T>[]> {
  try {
    const querySnapshot = await (instance ? instance.get(query) : query.get())
    return querySnapshot.docs as QueryDocumentSnapshot<T>[];
  } catch {
    throw Error("Failed to execute query");
  }
}