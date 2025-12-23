import { FirebaseError } from "firebase/app";
import { wrapFirestoreError, CampStarfishError } from "@/utils/errors/CampStarfishErrors";
import { DocumentReference, Query, Transaction, WriteBatch, DocumentSnapshot, getDoc as getFirestore, setDoc as setFirestore, updateDoc as updateFirestore, deleteDoc as deleteFirestore, getDocs as queryFirestore, WithFieldValue, DocumentData, UpdateData, FirestoreDataConverter } from "firebase/firestore";
import { wrap } from "module";

export async function getDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, transaction?: Transaction): Promise<AppModelType> {
  let doc: DocumentSnapshot<AppModelType, DbModelType>;
  try {
    ref = ref.withConverter(converter);
    doc = await (transaction ? transaction.get(ref) : getFirestore(ref));
  } 
  catch (error) {
    throw wrapFirestoreError(error, "Error getting document");
  }

  if (!doc.exists()) {
    throw new CampStarfishError({
      source: "camp-starfish",
      code: "document/not-found",
      userMessage: "Document not found"
    });
  }
  return doc.data();
}

export async function setDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
    await (instance ? instance.set(ref, data) : setFirestore(ref, data));
  } catch (error) {
    throw wrapFirestoreError(error, "Failed to create document");
  }
}

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
    await (instance ? instance.update(ref, data) : updateFirestore(ref, data));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "not-found") {
      throw new CampStarfishError({
        userMessage: "Can't update a document that doesn't exist",
        source: "firestore",
        code: "not-found",
        errorObject: error
      });
    }
    throw wrapFirestoreError(error, "Failed to update document");
  }
}

export async function deleteDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    await (instance ? instance.delete(ref) : deleteFirestore(ref));
  } catch (error) {
    throw wrapFirestoreError(error, "Failed to delete document");
  }
}

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(query: Query<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>): Promise<AppModelType[]> {
  try {
    query = query.withConverter(converter);
    const querySnapshot = await queryFirestore(query);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    throw wrapFirestoreError(error, "Failed to execute query");
  }
}