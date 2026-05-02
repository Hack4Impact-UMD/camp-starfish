import { useQueries } from "@tanstack/react-query";
import { getUseAlbumItemBlobOptions } from "./useAlbumItemBlob";

export interface AlbumItemIdentifier {
  albumId: string;
  albumItemId: string;
}

export default function useAlbumItemBlobs(albumItemIds: AlbumItemIdentifier[]) {
  return useQueries({
    queries: albumItemIds.map(({ albumId, albumItemId }) => getUseAlbumItemBlobOptions(albumId, albumItemId))
  })
}