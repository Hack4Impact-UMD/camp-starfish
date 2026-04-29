import { DistributiveKeyof, NonEmptyArray } from "@/utils/types/typeUtils";
import { AggregateType, DocumentData, DocumentSnapshot, QueryDocumentSnapshot, SetOptions, Transaction, UpdateData, WhereFilterOp, WriteBatch } from "firebase/firestore";

export type SetDocOptions = SetDocMergeOptions | SetDocOverwriteOptions;
export interface SetDocMergeOptions {
  instance?: Transaction | WriteBatch;
  mergeOptions: SetOptions;
}
export interface SetDocOverwriteOptions {
  instance?: Transaction | WriteBatch;
};

export type FirestoreDocumentFieldPath<T> = DistributiveKeyof<UpdateData<T>> & string;
export type FirestoreDocumentFieldPathAndID<T> = FirestoreDocumentFieldPath<T> | '__name__';

export interface WhereClause<DbModelType> {
  fieldPath: FirestoreDocumentFieldPathAndID<DbModelType>;
  operation: WhereFilterOp;
  value: unknown;
}

export interface OrderByClause<DbModelType> {
  fieldPath: FirestoreDocumentFieldPathAndID<DbModelType>;
  direction: 'asc' | 'desc';
}

export type LimitClause =
  | { limit: number; limitToLast?: never; }
  | { limit?: never; limitToLast: number; }
  | { limit?: never; limitToLast?: never; };

export type StartCursorClause =
  | { startAfter: DocumentSnapshot | unknown[]; startAt?: never; }
  | { startAfter?: never; startAt: DocumentSnapshot | unknown[]; }
  | { startAfter?: never; startAt?: never; };

export type EndCursorClause =
  | { endBefore: DocumentSnapshot | unknown[]; endAt?: never; }
  | { endBefore?: never; endAt: DocumentSnapshot | unknown[]; }
  | { endBefore?: never; endAt?: never; };

export type FirestoreQueryOptions<DbModelType extends DocumentData> = {
  where?: WhereClause<DbModelType>[];
  orderBy?: OrderByClause<DbModelType>[];
} & LimitClause & StartCursorClause & EndCursorClause;

export type PaginatedQueryResponse<AppModelType, DbModelType extends DocumentData> =
  | {
    docs: [];
    firstSnapshot?: never;
    lastSnapshot?: never;
  }
  | {
    docs: NonEmptyArray<AppModelType>;
    firstSnapshot: QueryDocumentSnapshot<DbModelType, DbModelType>;
    lastSnapshot: QueryDocumentSnapshot<DbModelType, DbModelType>;
  }

export type AggregationClause<DbModelType> = { aggregateFieldName: string; } & (
  | { operation: Extract<AggregateType, 'count'>; }
  | { operation: Extract<AggregateType, 'sum' | 'avg'>; sourceFieldPath: FirestoreDocumentFieldPath<DbModelType>; })

export type AggregationQueryOptions<DbModelType extends DocumentData> = FirestoreQueryOptions<DbModelType> & { aggregations: AggregationClause<DbModelType>[]; }