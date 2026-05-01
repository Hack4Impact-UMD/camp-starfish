import { getAlbumItemDoc } from "@/data/firestore/albumItems";
import { skipToken, useQuery } from "@tanstack/react-query";

interface UseAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

export default function useAlbumItem(req: UseAlbumItemRequest | undefined) {
  return useQuery({
    queryKey: ['albums', req?.albumId, 'albumItems', req?.albumItemId],
    queryFn: req ? (() => getAlbumItemDoc(req.albumId, req.albumItemId)) : skipToken,
  })
}