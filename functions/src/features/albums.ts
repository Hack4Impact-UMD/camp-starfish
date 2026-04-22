import { AlbumsSubcollection, RootLevelCollection } from "@/data/firestore/types/collections";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/firestore";
import { onObjectFinalized } from "firebase-functions/storage";
import { updateAlbumDoc } from "../data/firestore/albums";
import { FieldValue } from "firebase-admin/firestore";

const onAlbumItemCreated = onDocumentCreated(`/${RootLevelCollection.ALBUMS}/{albumId}/${AlbumsSubcollection.ALBUM_ITEMS}/{albumItemId}`, async (event) => {
  const { albumId } = event.params;
  await updateAlbumDoc(albumId, { numItems: FieldValue.increment(1) });
})

const onAlbumItemDeleted = onDocumentDeleted(`/${RootLevelCollection.ALBUMS}/{albumId}/${AlbumsSubcollection.ALBUM_ITEMS}/{albumItemId}`, async (event) => {
  const { albumId } = event.params;
  await updateAlbumDoc(albumId, { numItems: FieldValue.increment(-1) });
})

const onFileUploaded = onObjectFinalized(async (event) => {
  const pathParts = event.data.name.split('/');
  if (pathParts.length === 3 && pathParts[0] === 'albums' && pathParts[2] === 'thumbnail') {
    await updateAlbumDoc(pathParts[1], { thumbnailSrc: event.data.mediaLink });
  }
})

export const albumsCloudFunctions = {
  onAlbumItemCreated,
  onAlbumItemDeleted,
  onFileUploaded
}