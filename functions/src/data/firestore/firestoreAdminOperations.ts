import { AggregateField, AggregateType, CollectionGroup, CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, FirestoreDataConverter, GrpcStatus, PartialWithFieldValue, Query, SetOptions, Transaction, UpdateData, WhereFilterOp, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { isFirebaseError } from "../../types/error";
import { NestedFieldPath } from "@/utils/types/typeUtils";
import { Collection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";

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

type SetDocOptions = SetDocMergeOptions | SetDocOverwriteOptions;
interface SetDocMergeOptions {
  instance?: Transaction | WriteBatch;
  mergeOptions: SetOptions;
}
interface SetDocOverwriteOptions {
  instance?: Transaction | WriteBatch;
}

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

export async function updateDoc<AppModelType, DbModelType extends DocumentData>(ref: DocumentReference<AppModelType, DbModelType>, data: UpdateData<DbModelType>, converter: FirestoreDataConverter<AppModelType, DbModelType>, instance?: Transaction | WriteBatch): Promise<void> {
  try {
    ref = ref.withConverter(converter);
    // @ts-expect-error - both Transaction & WriteBatch have a set with the same signature, but TypeScript fails to recognize that
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

type QueryOptions<DbModelType extends DocumentData> = {
  where?: WhereClause<DbModelType>[];
  orderBy?: OrderByClause<DbModelType>[];
} & LimitClause & StartCursorClause & EndCursorClause;

function buildQuery<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | Collection, options?: QueryOptions<DbModelType>): Query<AppModelType, DbModelType> {
  let queryObj: Query<AppModelType, DbModelType> = typeof collection === 'string' ? adminDb.collectionGroup(collection) as CollectionGroup<AppModelType, DbModelType> : collection;
  if (options) {
    const { where = [], orderBy = [] } = options;
    // @ts-expect-error - fieldPath is not infinitely recursive
    where.forEach(({ fieldPath, operation, value }) => queryObj = queryObj.where(fieldPath, operation, value));
    orderBy.forEach(({ fieldPath, direction }) => queryObj = queryObj.orderBy(fieldPath, direction));

    if ('limit' in options && options.limit) {
      queryObj = queryObj.limit(options.limit);
    } else if ('limitToLast' in options && options.limitToLast) {
      queryObj = queryObj.limitToLast(options.limitToLast);
    }

    if ('startAfter' in options) {
      queryObj = queryObj.startAfter(options.startAfter);
    } else if ('startAt' in options) {
      queryObj = queryObj.startAt(options.startAt);
    }

    if ('endBefore' in options) {
      queryObj = queryObj.endBefore(options.endBefore);
    } else if ('endAt' in options) {
      queryObj = queryObj.endAt(options.endAt);
    }
  }
  return queryObj;
}

interface ExecuteQueryOptions<DbModelType extends DocumentData> {
  transaction?: Transaction;
  queryOptions?: QueryOptions<DbModelType>;
}

export async function executeQuery<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | Collection, converter: FirestoreDataConverter<AppModelType, DbModelType>, options?: ExecuteQueryOptions<DbModelType>): Promise<AppModelType[]> {
  try {
    const { transaction, queryOptions } = options ?? {};
    const queryObj = buildQuery(collection, queryOptions).withConverter(converter);
    const querySnapshot = await (transaction ? transaction.get(queryObj) : queryObj.get());
    return querySnapshot.docs.map(doc => doc.data());
  } catch {
    throw Error("Failed to execute query");
  }
}

type AggregationClause<DbModelType> = { aggregateFieldName: string; } & (
  | { operation: Extract<AggregateType, 'count'>; }
  | { operation: Extract<AggregateType, 'sum' | 'avg'>; sourceFieldPath: FirestoreDocumentFieldPath<DbModelType>; })

type AggregationOptions<DbModelType extends DocumentData> = QueryOptions<DbModelType> & { aggregations: AggregationClause<DbModelType>[]; }

export async function executeAggregation<AppModelType, DbModelType extends DocumentData>(collection: CollectionReference<AppModelType, DbModelType> | Collection, options: AggregationOptions<DbModelType>): Promise<{ [key: string]: number }> {
  try {
    const { aggregations, ...queryOptions } = options;
    const queryObj = buildQuery(collection, queryOptions);
    const aggregationObj: { [key: string]: AggregateField<number> } = {};
    aggregations.forEach(agg => {
      if (agg.operation === 'count') { aggregationObj[agg.aggregateFieldName] = AggregateField.count(); }
      else if (agg.operation === 'sum') { aggregationObj[agg.aggregateFieldName] = AggregateField.sum(agg.sourceFieldPath); }
      else if (agg.operation === 'avg') { aggregationObj[agg.aggregateFieldName] = AggregateField.average(agg.sourceFieldPath); }
    })
    const aggregateSnapshot = await queryObj.aggregate(aggregationObj).get();
    return aggregateSnapshot.data();
  } catch {
    throw Error("Failed to execute aggregation");
  }
}