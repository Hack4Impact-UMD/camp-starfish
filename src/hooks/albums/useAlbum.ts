import { getAlbumDoc } from "@/data/firestore/albums";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

export function getUseAlbumOptions(albumId: string | undefined) {
  return queryOptions({
    queryKey: ['albums', albumId],
    queryFn: albumId ? (() => getAlbumDoc(albumId)) : skipToken,
  });
}

export default function useAlbum(albumId: string | undefined) {
  return useQuery(getUseAlbumOptions(albumId));
}