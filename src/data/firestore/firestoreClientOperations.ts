import { NestedFieldPath } from "@/utils/types/typeUtils";
import { FirebaseError } from "firebase/app";
import { DocumentReference, Query, Transaction, WriteBatch, DocumentSnapshot, getDoc as getFirestore, updateDoc as updateFirestore, deleteDoc as deleteFirestore, getDocs as queryFirestore, WithFieldValue, DocumentData, UpdateData, FirestoreDataConverter, CollectionReference, WhereFilterOp, collectionGroup, where as whereFirestore, orderBy as orderByFirestore, limit, limitToLast, startAfter, startAt, endBefore, endAt, query, documentId, getAggregateFromServer, AggregateType, count, AggregateField, sum, average, SetOptions, PartialWithFieldValue } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Collection } from "./types/collections";

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

export async function assertDocumentDoesNotExist(ref: DocumentReference, instance?: Transaction): Promise<void> {
  const doc = await (instance ? instance.get(ref) : getFirestore(ref));
  if (doc.exists()) {
    throw Error("Document already exists");
  }
}

type SetDocOptions = SetDocMergeOptions | SetDocOverwriteOptions;
interface SetDocMergeOptions {
  instance?: Transaction | WriteBatch;
  mergeOptions: SetOptions;
}
interface SetDocOverwriteOptions {
  instance?: Transaction | WriteBatch;
};

export async function setDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, options?: SetDocOverwriteOptions): Promise<void>
export async function setDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: PartialWithFieldValue<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, options: SetDocMergeOptions): Promise<void>
export async function setDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: WithFieldValue<AppModelType> | PartialWithFieldValue<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, options?: SetDocOptions): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    options = options ?? {};
    const { instance } = options;
    if ('mergeOptions' in options) {
      // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
      await (instance ? instance.set(ref, data, options.mergeOptions) : ref.set(data as PartialWithFieldValue<AppModelType>, options.mergeOptions));
    } else {
      // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
      await (instance ? instance.set(ref, data) : ref.set(data as WithFieldValue<AppModelType>));
    }
  } catch {
    throw Error("Failed to set document")
  }
}

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<AppModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
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

export async function deleteDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.delete(ref) : deleteFirestore(ref));
  } catch {
    throw Error("Failed to delete document");
  }
}

type FirestoreDocumentFieldPath<T> = NestedFieldPath<T> | '__name__';

interface WhereClause<DbModelType> {
  fieldPath: FirestoreDocumentFieldPath<DbModelType>;
  operation: WhereFilterOp;
  value: unknown;
}

interface OrderByClause<DbModelType> {
  fieldPath: FirestoreDocumentFieldPath<DbModelType>;
  direction: 'asc' | 'desc';
}

type LimitClause = { limit: number } | { limitToLast: number } | { limit?: never; limitToLast?: never };
type StartCursorClause = { startAfter: DocumentSnapshot | unknown[] } | { startAt: DocumentSnapshot | unknown[] } | { startAfter?: never; startAt?: never };
type EndCursorClause = { endBefore: DocumentSnapshot | unknown[] } | { endAt: DocumentSnapshot | unknown[] } | { endBefore?: never; endAt?: never };

type QueryOptions<DbModelType extends DocumentData> = {
  where?: WhereClause<DbModelType>[];
  orderBy?: OrderByClause<DbModelType>[];
} & LimitClause & StartCursorClause & EndCursorClause;

function buildQuery<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | Collection, options?: QueryOptions<DbModelType>): Query<AppModelType, DbModelType> {
  let queryObj: Query<AppModelType, DbModelType> = typeof collection === 'string' ? collectionGroup(db, collection) as Query<AppModelType, DbModelType> : collection;
  if (options) {
    const { where = [], orderBy = [] } = options;
    // @ts-expect-error - fieldPath is not infinitely recursive
    const whereClauses = where.map(({ fieldPath, operation, value }) => whereFirestore(fieldPath === '__name__' ? documentId() : fieldPath, operation, value));
    const orderByClauses = orderBy.map(({ fieldPath, direction }) => orderByFirestore(fieldPath === '__name__' ? documentId() : fieldPath, direction));

    const limitAndCursorClauses = [];
    if ('limit' in options && options.limit) {
      limitAndCursorClauses.push(limit(options.limit));
    } else if ('limitToLast' in options && options.limitToLast) {
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
  return queryObj;
}

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | Collection, converter: FirestoreDataConverter<AppModelType, DbModelType>, options?: QueryOptions<DbModelType>): Promise<AppModelType[]> {
  try {
    const queryObj = buildQuery(collection, options).withConverter(converter);
    const querySnapshot = await queryFirestore(queryObj);
    return querySnapshot.docs.map(doc => doc.data());
  } catch {
    throw Error("Failed to execute query");
  }
}

type AggregationClause<DbModelType> = { aggregateFieldName: string; } & (
  | { operation: Extract<AggregateType, 'count'>; }
  | { operation: Extract<AggregateType, 'sum' | 'avg'>; sourceFieldPath: FirestoreDocumentFieldPath<DbModelType>; })

type AggregationOptions<DbModelType extends DocumentData> = QueryOptions<DbModelType> & { aggregations: AggregationClause<DbModelType>[]; }

export async function executeAggregation<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | Collection, converter: FirestoreDataConverter<AppModelType, DbModelType>, options: AggregationOptions<DbModelType>): Promise<{ [key: string]: number }> {
  try {
    const { aggregations, ...queryOptions } = options;
    const queryObj = buildQuery(collection, queryOptions);
    const aggregationObj: { [key: string]: AggregateField<number> } = {};
    aggregations.forEach(agg => {
      if (agg.operation === 'count') { aggregationObj[agg.aggregateFieldName] = count(); }
      else if (agg.operation === 'sum') { aggregationObj[agg.aggregateFieldName] = sum(agg.sourceFieldPath); }
      else if (agg.operation === 'avg') { aggregationObj[agg.aggregateFieldName] = average(agg.sourceFieldPath); }
    })
    const aggregateSnapshot = await getAggregateFromServer(queryObj, aggregationObj);
    return aggregateSnapshot.data();
  } catch {
    throw Error("Failed to execute aggregation");
  }
}