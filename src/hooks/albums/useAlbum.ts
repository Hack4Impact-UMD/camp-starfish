import { useQuery } from "@tanstack/react-query";
import { getAlbumById } from "@/data/firestore/albums";
import { AlbumID } from "@/types/albumTypes";

export default function useAlbum(albumId: string | undefined) {
  return useQuery<AlbumID>({
    queryKey: ["album", albumId],
    queryFn: () => {
      if (!albumId) {
        throw new Error("albumId is required to fetch album");
      }
      return getAlbumById(albumId);
    },
    enabled: !!albumId,
  });
}
