import { useQueries } from "@tanstack/react-query";
import { useAlbumItemBlobOptions } from "./useAlbumItemBlob";

export interface AlbumItemIdentifier {
  albumId: string;
  albumItemId: string;
}

export default function useAlbumItemBlobs(albumItemIds: AlbumItemIdentifier[]) {
  return useQueries({
    queries: albumItemIds.map(({ albumId, albumItemId }) => useAlbumItemBlobOptions(albumId, albumItemId))
  })
}