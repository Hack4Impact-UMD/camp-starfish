import { useQueries } from "@tanstack/react-query";
import { getAlbumItemBlob } from "./useAlbumItemBlob";

export interface AlbumItemIdentifier {
  albumId: string;
  albumItemId: string;
}

export default function useAlbumItemBlobs(albumItemIds: AlbumItemIdentifier[]) {
  return useQueries({
    queries: albumItemIds.map(({ albumId, albumItemId }) => ({
      queryKey: ['albums', albumId, 'albumItems', albumItemId, 'blob'],
      queryFn: () => getAlbumItemBlob(albumId, albumItemId),
      staleTime: Infinity
    }))
  })
}