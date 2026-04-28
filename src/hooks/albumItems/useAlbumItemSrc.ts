import { getFileURL } from "@/data/storage/storageClientOperations";
import { useQuery } from "@tanstack/react-query";

async function getAlbumItemSrc(albumId: string, albumItemId: string) {
  return await getFileURL(`albums/${albumId}/albumItems/${albumItemId}`);
}

export default function useAlbumItemSrc(albumId: string, albumItemId: string) {
  return useQuery({
    queryKey: ['albums', albumId, 'albumItems', albumItemId, 'src'],
    queryFn: () => getAlbumItemSrc(albumId, albumItemId),
  })
}