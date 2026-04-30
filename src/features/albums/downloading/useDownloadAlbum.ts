import { listAlbumItemDocs } from "@/data/firestore/albumItems";
import { AlbumItemDoc } from "@/data/firestore/types/documents"
import { FirestoreQueryOptions } from "@/data/firestore/types/queries"
import { getAlbumItemBlob } from "@/hooks/albumItems/useAlbumItemBlob";
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

      const albumItems = (await listAlbumItemDocs(albumId, updatedQueryOptions)).docs;
      const albumItemBlobs = await Promise.all(albumItems.map((albumItem) => client.fetchQuery({
        queryKey: ['albums', albumId, 'albumItems', albumItem.id, 'blob'],
        queryFn: () => getAlbumItemBlob(albumId, albumItem.id)
      })));
      await downloadFilesLocally({ files: albumItemBlobs });
    }
  });
}