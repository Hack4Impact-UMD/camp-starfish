import { getAlbumItemDoc } from "@/data/firestore/albumItems";
import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

interface UseAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

export function getUseAlbumItemOptions(req: UseAlbumItemRequest | undefined) {
  return queryOptions({
    queryKey: ['albums', req?.albumId, 'albumItems', req?.albumItemId],
    queryFn: req ? (() => getAlbumItemDoc(req.albumId, req.albumItemId)) : skipToken,
  });
}

export default function useAlbumItem(req: UseAlbumItemRequest | undefined) {
  return useQuery(getUseAlbumItemOptions(req));
}