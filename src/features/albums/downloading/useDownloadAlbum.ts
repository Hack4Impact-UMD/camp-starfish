import { AlbumItemDoc } from "@/data/firestore/types/documents"
import { FirestoreQueryOptions } from "@/data/firestore/types/queries"
import useAlbumItemBlobs, { AlbumItemIdentifier } from "@/hooks/albumItems/useAlbumItemBlobs"
import useAlbumItemsList from "@/hooks/albumItems/useAlbumItemsList"
import useDownloadFilesLocally from "@/hooks/useDownloadFilesLocally";
import { useMutation } from "@tanstack/react-query";

export default function useDownloadAlbum(albumId: string, queryOptions?: FirestoreQueryOptions<AlbumItemDoc>) {
  const updatedQueryOptions: FirestoreQueryOptions<AlbumItemDoc> = {
    limit: undefined,
    limitToLast: undefined,
    ...queryOptions
  };
  const albumItemsQuery = useAlbumItemsList(albumId, updatedQueryOptions, false);
  const albumItems = albumItemsQuery.data?.pages.flatMap((page) => page.docs) ?? [];
  const albumItemBlobQueries = useAlbumItemBlobs(albumItems.map((albumItem) => ({ albumId, albumItemId: albumItem.id })));
  const downloadFilesLocallyMutation = useDownloadFilesLocally();

  return useMutation({
    mutationFn: async () => {
      await albumItemsQuery.refetch();
      console.log(albumItems);
      await downloadFilesLocallyMutation.mutate({
        files: albumItemBlobQueries.map(albumItemBlobQuery => albumItemBlobQuery.data).filter(blob => !!blob)
      })
    }
  });
}