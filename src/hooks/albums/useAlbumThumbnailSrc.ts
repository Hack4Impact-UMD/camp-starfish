import { getFileURL } from "@/data/storage/storageClientOperations";
import { Album } from "@/types/albums/albumTypes";
import { skipToken, useQuery } from "@tanstack/react-query";

async function getAlbumThumbnailSrc(albumId: string) {
  return await getFileURL(`albums/${albumId}/thumbnail`);
}

export default function useAlbumThumbnailSrc(album: Album | undefined) {
  return useQuery({
    queryKey: ['albums', album?.id, 'thumbnailSrc'],
    queryFn: album && album.hasThumbnail ? (() => getAlbumThumbnailSrc(album.id)) : skipToken,
  })
}