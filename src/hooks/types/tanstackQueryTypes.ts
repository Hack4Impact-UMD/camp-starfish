import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export interface TanstackQueryFirestorePageParam<DbModel extends DocumentData> {
  direction: 'previous' | 'next';
  snapshot: QueryDocumentSnapshot<DbModel, DbModel>;
}