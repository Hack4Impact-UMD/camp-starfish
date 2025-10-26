import { FirebaseError } from "firebase/app";
import { DocumentReference, Query, Transaction, WriteBatch, DocumentSnapshot, getDoc as getFirestore, setDoc as setFirestore, updateDoc as updateFirestore, deleteDoc as deleteFirestore, getDocs as queryFirestore, WithFieldValue, DocumentData, QueryDocumentSnapshot, UpdateData } from "firebase/firestore";

export async function getDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, transaction?: Transaction): Promise<DocumentSnapshot<AppModelType, DbModelType>> {
  let doc: DocumentSnapshot<AppModelType, DbModelType>;
  try {
    doc = await (transaction ? transaction.get(ref) : getFirestore(ref));
  } catch {
    throw Error("Error getting document");
  }

  if (!doc.exists()) {
    throw Error("Document not found");
  }
  return doc;
}

export async function createDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    // @ts-expect-error
    await (instance ? instance.set(ref, data) : setFirestore(ref, data));
  } catch (error) {
    throw Error("Failed to create document");
  }
}

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
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

export async function deleteDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.delete(ref) : deleteFirestore(ref));
  } catch {
    throw Error("Failed to delete document");
  }}

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(query: Query<AppModelType, DbModelType>): Promise<QueryDocumentSnapshot<AppModelType, DbModelType>[]> {
  try {
    const querySnapshot = await queryFirestore(query);
    return querySnapshot.docs;
  } catch {
    throw Error("Failed to execute query");
  }
}