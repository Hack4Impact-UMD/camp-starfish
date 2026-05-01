import { getFileURL } from "@/data/storage/storageClientOperations";
import { AlbumItem } from "@/types/albums/albumTypes";
import { skipToken, useQuery } from "@tanstack/react-query";

async function getAlbumItemSrc(albumId: string, albumItemId: string) {
  return await getFileURL(`albums/${albumId}/albumItems/${albumItemId}`);
}

export default function useAlbumItemSrc(item: AlbumItem | undefined) {
  return useQuery({
    queryKey: ["albums", item?.albumId, "albumItems", item?.id, "src"],
    queryFn: item ? (() => getAlbumItemSrc(item.albumId, item.id)) : skipToken,
  });
}
