import { getUseAlbumItemOptions } from "@/hooks/albumItems/useAlbumItem";
import { getUseAlbumItemBlobOptions } from "@/hooks/albumItems/useAlbumItemBlob";
import { getUseAlbumOptions } from "@/hooks/albums/useAlbum";
import { downloadFilesLocally } from "@/hooks/useDownloadFilesLocally";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DownloadAlbumItemsRequest {
  albumId: string;
  albumItemIds: string[];
}

/**
 * Downloads a specific set of album items. A single item downloads as the file
 * itself; multiple items are bundled into a zip named after the album.
 */
export default function useDownloadAlbumItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ albumId, albumItemIds }: DownloadAlbumItemsRequest) => {
      const album = await queryClient.fetchQuery(getUseAlbumOptions(albumId));
      const items = await Promise.all(
        albumItemIds.map(async (albumItemId) => {
          const [albumItem, blob] = await Promise.all([
            queryClient.fetchQuery(
              getUseAlbumItemOptions({ albumId, albumItemId }),
            ),
            queryClient.fetchQuery(
              getUseAlbumItemBlobOptions(albumId, albumItemId),
            ),
          ]);
          return { blob, filename: albumItem.name };
        }),
      );
      await downloadFilesLocally({
        items,
        ...(items.length > 1 ? { zipFileName: `${album.name}.zip` } : {}),
      });
    },
  });
}
