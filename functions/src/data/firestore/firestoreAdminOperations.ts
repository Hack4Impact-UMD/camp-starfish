import { DocumentData, DocumentReference, DocumentSnapshot, FirestoreDataConverter, GrpcStatus, Query, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { isFirebaseError } from "../../types/error";

export async function getDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, transaction?: Transaction): Promise<AppModelType> {
  let doc: DocumentSnapshot<AppModelType, DbModelType>;
  try {
    ref = ref.withConverter(converter);
    doc = await (transaction ? transaction.get(ref) : ref.get());
  } catch {
    throw Error("Error getting document");
  }

  if (!doc.exists) {
    throw Error("Document not found");
  }
  return doc.data()!;
}

export async function createDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    await (instance ? instance.create(ref, data) : ref.create(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.ALREADY_EXISTS) {
      throw Error("Document already exists");
    }
    throw Error("Failed to create document");
  }
}

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    // @ts-expect-error
    await (instance ? instance.update(ref, data) : ref.update(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.NOT_FOUND) {
      throw Error("Can't update a document that doesn't exist");
    }
    throw Error("Failed to update document");
  }
}

export async function deleteDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter); 
    await (instance ? instance.delete(ref) : ref.delete());
  } catch {
    throw Error("Failed to delete document");
  }
}

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(query: Query<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction): Promise<AppModelType[]> {
  try {
    query = query.withConverter(converter);
    const querySnapshot = await (instance ? instance.get(query) : query.get())
    return querySnapshot.docs.map(doc => doc.data());
  } catch {
    throw Error("Failed to execute query");
  }
}