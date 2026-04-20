import { useQuery } from "@tanstack/react-query";
import { getFileURL } from "@/data/storage/storageClientOperations";

async function getAlbumThumbnailURL(albumId: string) {
  return await getFileURL(`albums/${albumId}/thumbnail`);
}

export default function useAlbumThumbnail(albumId: string) {
  return useQuery({
    queryKey: ['albums', albumId, 'thumbnail'],
    queryFn: async () => getAlbumThumbnailURL(albumId),
  })
}