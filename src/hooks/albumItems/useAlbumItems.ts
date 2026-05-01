import { getAlbumItemDocs } from "@/data/firestore/albumItems";
import { QueryOptions } from "@/data/firestore/firestoreClientOperations";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { AlbumItem } from "@/types/albums/albumTypes";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useAlbumItems(
  albumId: string | undefined,
  queryOptions?: QueryOptions<AlbumItemDoc>,
) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["albums", albumId, "albumItems", queryOptions],
    queryFn: albumId
      ? async () => {
          const page = await getAlbumItemDocs(albumId, queryOptions);
          page.docs.forEach((item: AlbumItem) =>
            queryClient.setQueryData(["albums", albumId, "albumItems", item.id], item),
          );
          return page.docs as AlbumItem[];
        }
      : skipToken,
  });
}
