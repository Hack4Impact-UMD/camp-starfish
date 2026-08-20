import { PaginatedQueryResponse } from "@/data/firestore/types/queries"
import { InfiniteData } from "@tanstack/react-query"
import { TanstackQueryFirestorePageParam } from "./types/tanstackQueryTypes"
import { DocumentData } from "firebase/firestore"

export function flattenFirestoreInfiniteData<AppModelType, DbModelType extends DocumentData>(data: InfiniteData<PaginatedQueryResponse<AppModelType, DbModelType>, TanstackQueryFirestorePageParam<DbModelType> | undefined>): AppModelType[] {
  return data.pages.flatMap(page => page.docs);
}