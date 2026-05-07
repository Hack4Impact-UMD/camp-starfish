import { AggregateField, AggregateType, CollectionGroup, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, GrpcStatus, PartialWithFieldValue, Query, QueryDocumentSnapshot, SetOptions, Transaction, UpdateData, WhereFilterOp, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { isFirebaseError } from "../../types/error";
import { Collection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";
import { DistributiveKeyof } from "@/utils/types/typeUtils";

export async function getDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, transaction?: Transaction): Promise<DocumentSnapshot<DbModelType, DbModelType>> {
  let doc: DocumentSnapshot<DbModelType, DbModelType>;
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

export async function createDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, data: WithFieldValue<DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.create(ref, data) : ref.create(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.ALREADY_EXISTS) {
      throw Error("Document already exists");
    }
    throw Error("Failed to create document");
  }
}

type SetDocOptions = SetDocMergeOptions | SetDocOverwriteOptions;
interface SetDocMergeOptions {
  instance?: Transaction | WriteBatch;
  mergeOptions: SetOptions;
}
interface SetDocOverwriteOptions {
  instance?: Transaction | WriteBatch;
}

export async function setDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, data: WithFieldValue<DbModelType>, options?: SetDocOverwriteOptions): Promise<void>
export async function setDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, data: PartialWithFieldValue<DbModelType>, options: SetDocMergeOptions): Promise<void>
export async function setDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, data: WithFieldValue<DbModelType> | PartialWithFieldValue<DbModelType>, options?: SetDocOptions): Promise<void> {
  try {
    options = options ?? {};
    const { instance } = options;
    if ('mergeOptions' in options) {
      // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
      await (instance ? instance.set(ref, data, options.mergeOptions) : ref.set(data as PartialWithFieldValue<DbModelType>, options.mergeOptions));
    } else {
      // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
      await (instance ? instance.set(ref, data) : ref.set(data as WithFieldValue<DbModelType>));
    }
  } catch {
    throw Error("Failed to set document")
  }
}

export async function updateDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, data: UpdateData<DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
    await (instance ? instance.update(ref, data) : ref.update(data));
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === GrpcStatus.NOT_FOUND) {
      throw Error("Can't update a document that doesn't exist");
    }
    throw Error("Failed to update document");
  }
}

export async function deleteDoc<DbModelType extends DocumentData>(ref: DocumentReference<DbModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    await (instance ? instance.delete(ref) : ref.delete());
  } catch {
    throw Error("Failed to delete document");
  }
}

type FirestoreDocumentFieldPath<T> = DistributiveKeyof<UpdateData<T>> & string;
type FirestoreDocumentFieldPathAndID<T> = FirestoreDocumentFieldPath<T> | '__name__';

interface WhereClause<DbModelType> {
  fieldPath: FirestoreDocumentFieldPathAndID<DbModelType>;
  operation: WhereFilterOp;
  value: unknown;
}

interface OrderByClause<DbModelType> {
  fieldPath: FirestoreDocumentFieldPathAndID<DbModelType>;
  direction: 'asc' | 'desc';
}

type LimitClause =
  | { limit: number; limitToLast?: never; }
  | { limit?: never; limitToLast: number; }
  | { limit?: never; limitToLast?: never; };
type StartCursorClause =
  | { startAfter: DocumentSnapshot | unknown[]; startAt?: never; }
  | { startAfter?: never; startAt: DocumentSnapshot | unknown[]; }
  | { startAfter?: never; startAt?: never; };
type EndCursorClause =
  | { endBefore: DocumentSnapshot | unknown[]; endAt?: never; }
  | { endBefore?: never; endAt: DocumentSnapshot | unknown[]; }
  | { endBefore?: never; endAt?: never; };

type FirestoreQueryOptions<DbModelType extends DocumentData> = {
  where?: WhereClause<DbModelType>[];
  orderBy?: OrderByClause<DbModelType>[];
} & LimitClause & StartCursorClause & EndCursorClause;

function buildQuery<DbModelType extends DocumentData>(collection: CollectionReference<DbModelType, DbModelType> | Collection, options?: FirestoreQueryOptions<DbModelType>): Query<DbModelType, DbModelType> {
  let queryObj: Query<DbModelType, DbModelType> = typeof collection === 'string' ? adminDb.collectionGroup(collection) as CollectionGroup<DbModelType, DbModelType> : collection;
  if (options) {
    const { where = [], orderBy = [] } = options;
    where.forEach(({ fieldPath, operation, value }) => queryObj = queryObj.where(fieldPath, operation, value));
    orderBy.forEach(({ fieldPath, direction }) => queryObj = queryObj.orderBy(fieldPath, direction));

    if ('limit' in options && options.limit) {
      queryObj = queryObj.limit(options.limit);
    } else if ('limitToLast' in options && options.limitToLast) {
      queryObj = queryObj.limitToLast(options.limitToLast);
    }

    if ('startAfter' in options && options.startAfter) {
      queryObj = Array.isArray(options.startAfter) ? queryObj.startAfter(...options.startAfter) : queryObj.startAfter(options.startAfter);
    } else if ('startAt' in options && options.startAt) {
      queryObj = Array.isArray(options.startAt) ? queryObj.startAt(...options.startAt) : queryObj.startAt(options.startAt);
    }

    if ('endBefore' in options && options.endBefore) {
      queryObj = Array.isArray(options.endBefore) ? queryObj.endBefore(...options.endBefore) : queryObj.endBefore(options.endBefore);
    } else if ('endAt' in options && options.endAt) {
      queryObj = Array.isArray(options.endAt) ? queryObj.endAt(...options.endAt) : queryObj.endAt(options.endAt);
    }
  }
  return queryObj;
}

export interface ExecuteQueryOptions<DbModelType extends DocumentData> {
  transaction?: Transaction;
  queryOptions?: FirestoreQueryOptions<DbModelType>;
}

export async function executeQuery<DbModelType extends DocumentData>(collection: CollectionReference<DbModelType, DbModelType> | Collection, options?: ExecuteQueryOptions<DbModelType>): Promise<QueryDocumentSnapshot<DbModelType, DbModelType>[]> {
  try {
    const { transaction, queryOptions } = options ?? {};
    const queryObj = buildQuery(collection, queryOptions);
    const querySnapshot = await (transaction ? transaction.get(queryObj) : queryObj.get());
    return querySnapshot.docs;
  } catch {
    throw Error("Failed to execute query");
  }
}

type AggregationClause<DbModelType> = { aggregateFieldName: string; } & (
  | { operation: Extract<AggregateType, 'count'>; }
  | { operation: Extract<AggregateType, 'sum' | 'avg'>; sourceFieldPath: FirestoreDocumentFieldPath<DbModelType>; })

type AggregationQueryOptions<DbModelType extends DocumentData> = FirestoreQueryOptions<DbModelType> & { aggregations: AggregationClause<DbModelType>[]; }

export interface ExecuteAggregationQueryOptions<DbModelType extends DocumentData> {
  transaction?: Transaction;
  aggregationQueryOptions: AggregationQueryOptions<DbModelType>;
}

export async function executeAggregationQuery<DbModelType extends DocumentData>(collection: CollectionReference<DbModelType, DbModelType> | Collection, options: ExecuteAggregationQueryOptions<DbModelType>): Promise<{ [key: string]: number | null }> {
  try {
    const { transaction, aggregationQueryOptions } = options;
    const { aggregations, ...queryOptions } = aggregationQueryOptions;
    const queryObj = buildQuery(collection, queryOptions);
    const aggregationObj: { [key: string]: AggregateField<number | null> } = {};
    aggregations.forEach(agg => {
      if (agg.operation === 'count') { aggregationObj[agg.aggregateFieldName] = AggregateField.count(); }
      else if (agg.operation === 'sum') { aggregationObj[agg.aggregateFieldName] = AggregateField.sum(agg.sourceFieldPath); }
      else if (agg.operation === 'avg') { aggregationObj[agg.aggregateFieldName] = AggregateField.average(agg.sourceFieldPath); }
    })
    const aggregationQueryObj = queryObj.aggregate(aggregationObj);
    const aggregateSnapshot = await (transaction ? transaction.get(aggregationQueryObj) : aggregationQueryObj.get());
    return aggregateSnapshot.data();
  } catch {
    throw Error("Failed to execute aggregation");
  }
}