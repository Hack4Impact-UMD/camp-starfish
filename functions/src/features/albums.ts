import { AlbumsSubcollection, RootLevelCollection } from "@/data/firestore/types/collections";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/firestore";
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

export const albumsCloudFunctions = {
  onAlbumItemCreated,
  onAlbumItemDeleted
}