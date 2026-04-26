import { getAlbumDocs } from "@/data/firestore/albums";
import { QueryOptions } from "@/data/firestore/types/queries";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { Album } from "@/types/albums/albumTypes";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";

export default function useAlbums(queryOptions?: QueryOptions<AlbumDoc>) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: ['albums', queryOptions],
    queryFn: async ({ pageParam }) => {
      const updatedQueryOptions = queryOptions ? { ...queryOptions } : {};
      if (pageParam) {
        if (pageParam.direction === 'next') {
          updatedQueryOptions.startAfter = pageParam.snapshot;
          updatedQueryOptions.startAt = undefined;
        } else {
          updatedQueryOptions.endBefore = pageParam.snapshot;
          updatedQueryOptions.endAt = undefined;
        }
      }
      const albumsPage = await getAlbumDocs(updatedQueryOptions);
      albumsPage.docs.forEach((album: Album) => queryClient.setQueryData(['albums', album.id], album))
      return albumsPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<AlbumDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
  });
}