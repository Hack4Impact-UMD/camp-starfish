import { getAlbumById } from "@/data/firestore/albums";
import { useQuery } from "@tanstack/react-query";

export default function useAlbumById(albumId: string) {
  return useQuery({
    queryKey: ['albums', albumId],
    queryFn: () => getAlbumById(albumId),
  })
}