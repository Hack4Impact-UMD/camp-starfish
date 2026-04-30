import { listAlbumItemDocs } from "@/data/firestore/albumItems";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { AlbumItem } from "@/types/albums/albumTypes";
import { infiniteQueryOptions, queryOptions, useInfiniteQuery, UseInfiniteQueryOptions, useQueryClient } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";

export function useAlbumItemListOptions(albumId: string, firestoreQueryOptions?: FirestoreQueryOptions<AlbumItemDoc>) {
  return infiniteQueryOptions({
    queryKey: ['albums', albumId, 'albumItems', firestoreQueryOptions],
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
      const albumItemsPage = await listAlbumItemDocs(albumId, updatedQueryOptions);
      albumItemsPage.docs.forEach((albumItem: AlbumItem) => client.setQueryData(['albums', albumId, 'albumItems', albumItem.id], albumItem))
      return albumItemsPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<AlbumItemDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined
  })
}

export default function useAlbumItemsList(albumId: string, firestoreQueryOptions?: FirestoreQueryOptions<AlbumItemDoc>) {
  return useInfiniteQuery(useAlbumItemListOptions(albumId, firestoreQueryOptions));
}