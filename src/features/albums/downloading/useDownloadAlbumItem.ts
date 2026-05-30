import { getUseAlbumItemOptions } from "@/hooks/albumItems/useAlbumItem";
import { getUseAlbumItemBlobOptions } from "@/hooks/albumItems/useAlbumItemBlob";
import { downloadFilesLocally } from "@/hooks/useDownloadFilesLocally";
import { useMutation } from "@tanstack/react-query";

interface DownloadAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

export default function useDownloadAlbumItem() {
  return useMutation({
    mutationFn: async (req: DownloadAlbumItemRequest, { client }) => {
      const { albumId, albumItemId } = req;
      const [albumItem, albumItemBlob] = await Promise.all([
        client.fetchQuery(getUseAlbumItemOptions({ albumId, albumItemId })),
        client.fetchQuery(getUseAlbumItemBlobOptions(albumId, albumItemId)),
      ]);
      await downloadFilesLocally({
        items: [
          { blob: albumItemBlob, filename: albumItem.name }
        ]
      });
    }
  });
}