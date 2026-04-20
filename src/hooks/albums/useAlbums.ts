import { getAlbumDocs } from "@/data/firestore/albums";
import { QueryOptions } from "@/data/firestore/firestoreClientOperations";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { Album } from "@/types/albums/albumTypes";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function useAlbums(queryOptions: QueryOptions<AlbumDoc>) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: ['albums', queryOptions],
    queryFn: async ({ pageParam }) => {
      const albumsPage = await getAlbumDocs({
        ...queryOptions,
        startAfter: pageParam,
        startAt: undefined
      });
      albumsPage.docs.forEach((album: Album) => queryClient.setQueryData(['albums', album.id], album))
      return albumsPage;
    },
    initialPageParam: undefined as QueryDocumentSnapshot<AlbumDoc, AlbumDoc> | undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot
  });
}