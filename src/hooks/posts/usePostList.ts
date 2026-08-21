import { listPostDocs } from "@/data/firestore/posts";
import { PostDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { Post } from "@/types/sessions/sessionTypes";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";
import { flattenFirestoreInfiniteData } from "../utils";

export function postListQueryOptions(firestoreQueryOptions: FirestoreQueryOptions<PostDoc> = {}) {
  return infiniteQueryOptions({
    queryKey: ['posts', firestoreQueryOptions],
    queryFn: async ({ pageParam, client }) => {
      const updatedQueryOptions = firestoreQueryOptions ? { ...firestoreQueryOptions } : {};
      if (pageParam) {
        if (pageParam.direction === 'next') {
          updatedQueryOptions.startAfter = pageParam.snapshot;
          updatedQueryOptions.startAt = undefined;
        } else {
          updatedQueryOptions.endBefore = pageParam.snapshot;
          updatedQueryOptions.endAt = undefined;
        }
      }
      const postsPage = await listPostDocs(updatedQueryOptions);
      postsPage.docs.forEach((post: Post) => client.setQueryData(['posts', post.id], post))
      return postsPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<PostDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
    select: flattenFirestoreInfiniteData,
  });
}

export default function usePostList(firestoreQueryOptions: FirestoreQueryOptions<PostDoc> = {}) {
  return useInfiniteQuery(postListQueryOptions(firestoreQueryOptions));
}