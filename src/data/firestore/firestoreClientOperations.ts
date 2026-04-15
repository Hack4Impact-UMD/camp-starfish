import { NestedFieldPath } from "@/utils/types/typeUtils";
import { FirebaseError } from "firebase/app";
import { DocumentReference, Query, Transaction, WriteBatch, DocumentSnapshot, getDoc as getFirestore, setDoc as setFirestore, updateDoc as updateFirestore, deleteDoc as deleteFirestore, getDocs as queryFirestore, WithFieldValue, DocumentData, UpdateData, FirestoreDataConverter, CollectionReference, WhereFilterOp, collectionGroup, where as whereFirestore, orderBy as orderByFirestore, limit, limitToLast, startAfter, startAt, endBefore, endAt, query } from "firebase/firestore";
import { db } from "@/config/firebase";
import { AlbumsSubcollection, Collection, SectionsSubcollection, SessionsSubcollection } from "./types/collections";

export async function getDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, transaction?: Transaction): Promise<AppModelType> {
  let doc: DocumentSnapshot<AppModelType, DbModelType>;
  try {
    ref = ref.withConverter(converter);
    doc = await (transaction ? transaction.get(ref) : getFirestore(ref));
  } catch {
    throw Error("Error getting document");
  }

  if (!doc.exists()) {
    throw Error("Document not found");
  }
  return doc.data();
}

export async function setDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
    await (instance ? instance.set(ref, data) : setFirestore(ref, data));
  } catch (error) {
    console.error("Failed to create document. Full error:", error);
    if (error instanceof FirebaseError) {
      throw Error(`Failed to create document: ${error.code} - ${error.message}`);
    }
    throw Error("Failed to create document");
  }
}

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
    await (instance ? instance.update(ref, data) : updateFirestore(ref, data));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "not-found") {
      throw Error("Attempted to update a document that doesn't exist");
    }
    throw Error("Failed to update document");
  }
}

export async function deleteDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    await (instance ? instance.delete(ref) : deleteFirestore(ref));
  } catch {
    throw Error("Failed to delete document");
  }
}

interface WhereClause<DbModelType> {
  fieldPath: NestedFieldPath<DbModelType>;
  operation: WhereFilterOp;
  value: unknown;
}

interface OrderByClause<DbModelType> {
  fieldPath: NestedFieldPath<DbModelType>;
  direction: 'asc' | 'desc';
}

type LimitClause = { limit: number } | { limitToLast: number } | {};
type StartCursorClause = { startAfter?: unknown[] } | { startAt?: unknown[] } | {};
type EndCursorClause = { endBefore?: unknown[] } | { endAt?: unknown[] };

type ExecuteQueryOptions<DbModelType extends DocumentData> = {
  where?: WhereClause<DbModelType>[];
  orderBy?: OrderByClause<DbModelType>[];
} & LimitClause & StartCursorClause & EndCursorClause;

type CollectionGroupQuery = Collection | AlbumsSubcollection | SessionsSubcollection | SectionsSubcollection;

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | CollectionGroupQuery, converter: FirestoreDataConverter<AppModelType, DbModelType>, options?: ExecuteQueryOptions<DbModelType>): Promise<AppModelType[]> {
  try {
    let queryObj: Query<AppModelType, DbModelType> = typeof collection === 'string' ? collectionGroup(db, collection) as Query<AppModelType, DbModelType> : collection;
    queryObj = queryObj.withConverter(converter);
    if (options) {
      const { where = [], orderBy = [] } = options;
      // @ts-expect-error - fieldPath is not infinitely recursive
      const whereClauses = where.map(({ fieldPath, operation, value }) => whereFirestore(fieldPath, operation, value));
      const orderByClauses = orderBy.map(({ fieldPath, direction }) => orderByFirestore(fieldPath, direction));
      
      const limitAndCursorClauses = [];
      if ('limit' in options) {
        limitAndCursorClauses.push(limit(options.limit));
      } else if ('limitToLast' in options) {
        limitAndCursorClauses.push(limitToLast(options.limitToLast));
      }

      if ('startAfter' in options) {
        limitAndCursorClauses.push(startAfter(options.startAfter));
      } else if ('startAt' in options) {
        limitAndCursorClauses.push(startAt(options.startAt));
      }

      if ('endBefore' in options) {
        limitAndCursorClauses.push(endBefore(options.endBefore));
      } else if ('endAt' in options) {
        limitAndCursorClauses.push(endAt(options.endAt));
      }

      queryObj = query(queryObj, ...whereClauses, ...orderByClauses, ...limitAndCursorClauses);
    }
    const querySnapshot = await queryFirestore(queryObj);
    return querySnapshot.docs.map(doc => doc.data());
  } catch {
    throw Error("Failed to execute query");
  }
}