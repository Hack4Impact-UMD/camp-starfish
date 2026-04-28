import { getFileBlob } from "@/data/storage/storageClientOperations";
import { useQuery } from "@tanstack/react-query";

export async function getAlbumItemBlob(albumId: string, albumItemId: string) {
  return await getFileBlob(`albums/${albumId}/albumItems/${albumItemId}`);
}

export default function useAlbumItemBlob(albumId: string, albumItemId: string) {
  return useQuery({
    queryKey: ['albums', albumId, 'albumItems', albumItemId, 'blob'],
    queryFn: () => getAlbumItemBlob(albumId, albumItemId),
  });
}