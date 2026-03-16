import { AlbumsSubcollection, Collection } from "@/data/firestore/types/collections";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/firestore";
import { updateAlbum } from "../data/firestore/albums";
import { FieldValue } from "firebase-admin/firestore";

const onAlbumItemCreated = onDocumentCreated(`/${Collection.ALBUMS}/{albumId}/${AlbumsSubcollection.ALBUM_ITEMS}/{albumItemId}`, async (event) => {
  const { albumId } = event.params;
  await updateAlbum(albumId, { numItems: FieldValue.increment(1) });
})

const onAlbumItemDeleted = onDocumentDeleted(`/${Collection.ALBUMS}/{albumId}/${AlbumsSubcollection.ALBUM_ITEMS}/{albumItemId}`, async (event) => {
  const { albumId } = event.params;
  await updateAlbum(albumId, { numItems: FieldValue.increment(-1) });
})

export const albumsCloudFunctions = {
  onAlbumItemCreated,
  onAlbumItemDeleted
}