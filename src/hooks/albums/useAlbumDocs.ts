import { getAlbumDocs } from "@/data/firestore/albums";
import { QueryOptions } from "@/data/firestore/firestoreClientOperations";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { Album } from "@/types/albums/albumTypes";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { QueryDocumentSnapshot } from "firebase/firestore";

interface TanstackQueryFirestorePageParam {
  direction: 'previous' | 'next';
  snapshot: QueryDocumentSnapshot<AlbumDoc, AlbumDoc>;
}

export default function useAlbums(queryOptions?: QueryOptions<AlbumDoc>) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: ['albums', queryOptions],
    queryFn: async ({ pageParam }) => {
      if (!queryOptions) { queryOptions = {} }
      if (pageParam) {
        if (pageParam.direction === 'previous') {
          queryOptions.startAfter = pageParam.snapshot;
          queryOptions.startAt = undefined;
        } else {
          queryOptions.endBefore = pageParam.snapshot;
          queryOptions.endAt = undefined;
        }
      }
      const albumsPage = await getAlbumDocs(queryOptions);
      albumsPage.docs.forEach((album: Album) => queryClient.setQueryData(['albums', album.id], album))
      return albumsPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
  });
}