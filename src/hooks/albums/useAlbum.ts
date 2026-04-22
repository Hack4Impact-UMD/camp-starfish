import { getAlbumDocById } from "@/data/firestore/albums";
import { skipToken, useQuery } from "@tanstack/react-query";

export default function useAlbum(albumId: string | undefined) {
  return useQuery({
    queryKey: ['albums', albumId],
    queryFn: albumId ? (() => getAlbumDocById(albumId)) : skipToken,
  })
}