import { listAlbumItemDocs } from "@/data/firestore/albumItems";
import { AlbumItemDoc } from "@/data/firestore/types/documents"
import { FirestoreQueryOptions } from "@/data/firestore/types/queries"
import { getAlbumItemBlob } from "@/hooks/albumItems/useAlbumItemBlob";
import { getUseAlbumOptions } from "@/hooks/albums/useAlbum";
import { downloadFilesLocally } from "@/hooks/useDownloadFilesLocally";
import { useMutation } from "@tanstack/react-query";

interface DownloadAlbumRequest {
  albumId: string;
  queryOptions?: FirestoreQueryOptions<AlbumItemDoc>;
}

export default function useDownloadAlbum() {
  return useMutation({
    mutationFn: async (req: DownloadAlbumRequest, { client }) => {
      const { albumId, queryOptions } = req;
      const updatedQueryOptions = {
        ...queryOptions,
        limit: undefined,
        limitToLast: undefined
      };

      const album = await client.fetchQuery(getUseAlbumOptions(albumId));
      const albumItems = (await listAlbumItemDocs(albumId, updatedQueryOptions)).docs;
      const albumItemBlobs = await Promise.all(albumItems.map((albumItem) => client.fetchQuery({
        queryKey: ['albums', albumId, 'albumItems', albumItem.id, 'blob'],
        queryFn: () => getAlbumItemBlob(albumId, albumItem.id)
      })));
      await downloadFilesLocally({
        items: albumItems.map((albumItem, index) => ({ blob: albumItemBlobs[index], filename: albumItem.name })),
        zipFileName: `${album.name}.zip`
      });
    }
  });
}