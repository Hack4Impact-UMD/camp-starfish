import { AlbumsSubcollection, RootLevelCollection } from "@/data/firestore/types/collections";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/firestore";
import { onObjectFinalized } from "firebase-functions/storage";
import { getAlbumDoc, updateAlbumDoc } from "../data/firestore/albums";
import { FieldValue, Timestamp, UpdateData } from "firebase-admin/firestore";
import { deleteFile } from "../data/storage/storageAdminOperations";
import { getNewestAlbumItemInAlbum, getOldestAlbumItemInAlbum, updateAlbumItemDoc } from "../data/firestore/albumItems";
import { adminDb } from "../config/firebaseAdminConfig";
import { AlbumDoc, AlbumItemDoc } from "@/data/firestore/types/documents";
import { AlbumItem } from "@/types/albums/albumTypes";

const onAlbumDeleted = onDocumentDeleted(`/${RootLevelCollection.ALBUMS}/{albumId}`, async (event) => {
  const promises = [
    adminDb.recursiveDelete(adminDb.collection(RootLevelCollection.ALBUMS).doc(event.params.albumId))
  ];
  const hasThumbnail = event.data?.data()?.thumbnailSrc !== undefined;
  if (hasThumbnail) {
    promises.push(deleteFile(`/albums/${event.params.albumId}/thumbnail`));
  }
  await Promise.all(promises);
});

const onAlbumItemCreated = onDocumentCreated(`/${RootLevelCollection.ALBUMS}/{albumId}/${AlbumsSubcollection.ALBUM_ITEMS}/{albumItemId}`, async (event) => {
  const { albumId } = event.params;
  const albumItem = event.data?.data() as AlbumItemDoc;
  await adminDb.runTransaction(async (transaction) => {
    const album = await getAlbumDoc(albumId, transaction);
    const updates: UpdateData<AlbumDoc> = { numItems: album.numItems + 1 };
    if (!album.startDate || albumItem.dateTaken < Timestamp.fromDate(album.startDate.toDate())) {
      updates.startDate = albumItem.dateTaken;
    }
    if (!album.endDate || albumItem.dateTaken > Timestamp.fromDate(album.endDate.toDate())) {
      updates.endDate = albumItem.dateTaken;
    }
    await updateAlbumDoc(albumId, updates, transaction);
  });
})

const onAlbumItemDeleted = onDocumentDeleted(`/${RootLevelCollection.ALBUMS}/{albumId}/${AlbumsSubcollection.ALBUM_ITEMS}/{albumItemId}`, async (event) => {
  const { albumId, albumItemId } = event.params;
  try {
    await deleteFile(`/albums/${albumId}/albumItems/${albumItemId}`);
    await adminDb.runTransaction(async (transaction) => {
      const oldestAlbumItem = await getOldestAlbumItemInAlbum(albumId, transaction);
      if (oldestAlbumItem === null) {
        await updateAlbumDoc(albumId, {
          numItems: FieldValue.increment(-1),
          startDate: null,
          endDate: null
        }, transaction);
        return;
      }

      const newestAlbumItem = await getNewestAlbumItemInAlbum(albumId, transaction) as AlbumItem;
      await updateAlbumDoc(albumId, {
        numItems: FieldValue.increment(-1),
        startDate: Timestamp.fromDate(newestAlbumItem.dateTaken.toDate()),
        endDate: Timestamp.fromDate(oldestAlbumItem.dateTaken.toDate())
      }, transaction)
    });
  } catch { }
})

const onFileUploaded = onObjectFinalized(async (event) => {
  const pathParts = event.data.name.split('/');
  if (pathParts.length === 3 && pathParts[0] === 'albums' && pathParts[2] === 'thumbnail') {
    await updateAlbumDoc(pathParts[1], { thumbnailSrc: event.data.mediaLink });
  } else if (pathParts.length === 4 && pathParts[0] === 'albums' && pathParts[2] === 'albumItems') {
    await updateAlbumItemDoc(pathParts[1], pathParts[3], { src: event.data.mediaLink });
  }
})

export const albumsCloudFunctions = {
  onAlbumDeleted,
  onAlbumItemCreated,
  onAlbumItemDeleted,
  onFileUploaded
}