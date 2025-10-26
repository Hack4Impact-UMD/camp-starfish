import { DocumentData, DocumentReference, DocumentSnapshot, GrpcStatus, Query, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { isFirebaseError } from "../types/error";

export async function getDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, transaction?: Transaction): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  let doc: DocumentSnapshot<AppModelType, DbModelType>;
  try {
    doc = await (transaction ? transaction.get(ref) : ref.get());
  } catch {
    throw Error("Error getting document");
  }

  if (!doc.exists) {
    throw Error("Document not found");
  }
  return doc;
}

export async function createDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.create(ref, data) : ref.create(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.ALREADY_EXISTS) {
      throw Error("Document already exists");
    }
    throw Error("Failed to create document");
  }
}

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
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

export async function deleteDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.delete(ref) : ref.delete());
  } catch {
    throw Error("Failed to delete document");
  }
}

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(query: Query<AppModelType, DbModelType>, instance?: Transaction): Promise<QueryDocumentSnapshot<AppModelType, DbModelType>[]> {
  try {
    const querySnapshot = await (instance ? instance.get(query) : query.get())
    return querySnapshot.docs;
  } catch {
    throw Error("Failed to execute query");
  }
}