import { getAlbumById } from "@/data/firestore/albums";
import { skipToken, useQuery } from "@tanstack/react-query";

export default function useAlbumById(albumId: string | undefined) {
  return useQuery({
    queryKey: ['albums', albumId],
    queryFn: albumId ? (() => getAlbumById(albumId)) : skipToken,
  })
}