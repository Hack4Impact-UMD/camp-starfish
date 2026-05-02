import { getFileBlob } from "@/data/storage/storageClientOperations";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function getAlbumItemBlob(albumId: string, albumItemId: string) {
  return await getFileBlob(`albums/${albumId}/albumItems/${albumItemId}`);
}

export function getUseAlbumItemBlobOptions(albumId: string, albumItemId: string) {
  return queryOptions({
    queryKey: ['albums', albumId, 'albumItems', albumItemId, 'blob'],
    queryFn: () => getAlbumItemBlob(albumId, albumItemId),
    staleTime: Infinity
  })
}

export default function useAlbumItemBlob(albumId: string, albumItemId: string) {
  return useQuery(getUseAlbumItemBlobOptions(albumId, albumItemId));
}