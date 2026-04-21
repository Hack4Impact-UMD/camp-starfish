import { skipToken, useQuery } from "@tanstack/react-query";
import { getFileURL } from "@/data/storage/storageClientOperations";

async function getAlbumThumbnailURL(albumId: string) {
  return await getFileURL(`albums/${albumId}/thumbnail`);
}

export default function useAlbumThumbnail(albumId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['albums', albumId, 'thumbnail'],
    queryFn: albumId && enabled ? (async () => getAlbumThumbnailURL(albumId)) : skipToken,
  })
}