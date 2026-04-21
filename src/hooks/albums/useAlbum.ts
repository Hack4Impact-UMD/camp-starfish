import useAlbumDoc from "./useAlbumDoc";
import useAlbumThumbnailURL from "./useAlbumThumbnailURL";

export default function useAlbum(albumId: string, options: { albumThumbnailURL: boolean }) {
  const albumDocQuery = useAlbumDoc(albumId);
  const albumThumbnailUrlQuery = useAlbumThumbnailURL(albumId, options.albumThumbnailURL && albumDocQuery.isSuccess && albumDocQuery.data.hasThumbnail);

  return {
    albumDoc: albumDocQuery,
    albumThumbnailQuery: albumThumbnailUrlQuery
  }
}