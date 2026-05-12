import { useQueries } from "@tanstack/react-query";
import { AlbumItemIdentifier } from "./useAlbumItemBlobs";
import { getAlbumItemSrc } from "./useAlbumItemSrc";

export default function useAlbumItemSrcs(albumItemIds: AlbumItemIdentifier[]) {
  return useQueries({
    queries: albumItemIds.map(({ albumId, albumItemId }) => ({
      queryKey: ['albums', albumId, 'albumItems', albumItemId, 'src'],
      queryFn: () => getAlbumItemSrc(albumId, albumItemId),
      staleTime: Infinity
    }))
  })
}