import { AlbumItem } from "@/types/albums/albumTypes";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { Transaction, WriteBatch, QueryDocumentSnapshot, DocumentReference, DocumentSnapshot, UpdateData, WithFieldValue, CollectionReference } from "firebase-admin/firestore";
import { getDoc, createDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreAdminOperations"
import { AlbumsSubcollection, RootLevelCollection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

function fromFirestore(snapshot: DocumentSnapshot<AlbumItemDoc, AlbumItemDoc> | QueryDocumentSnapshot<AlbumItemDoc, AlbumItemDoc>): AlbumItem {
  if (!snapshot.exists) { throw Error("Document not found"); };
  const albumItemDoc = snapshot.data() as AlbumItemDoc;
  return {
    id: snapshot.ref.id,
    albumId: snapshot.ref.parent.parent!.id,
    src: albumItemDoc.src,
    name: albumItemDoc.name,
    dateTaken: moment(albumItemDoc.dateTaken.toMillis()),
    inReview: albumItemDoc.inReview,
    tagIds: albumItemDoc.tagIds,
  }
}

export async function getAlbumItemDoc(albumId: string, albumItemId: string, transaction?: Transaction): Promise<AlbumItem> {
  const snapshot = await getDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function createAlbumItemDoc(albumId: string, albumItem: WithFieldValue<AlbumItemDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const albumItemId = uuidv4();
  await createDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, albumItem, instance);
  return albumItemId;
}

export async function updateAlbumItemDoc(albumId: string, albumItemId: string, updates: UpdateData<AlbumItemDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, updates, instance);
}

export async function deleteAlbumItemDoc(albumId: string, albumItemId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, instance);
}

export async function getOldestAlbumItemInAlbum(albumId: string, transaction?: Transaction) {
  const snapshot = await executeQuery<AlbumItemDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS) as CollectionReference<AlbumItemDoc, AlbumItemDoc>,
    {
      transaction,
      queryOptions: {
        orderBy: [{ fieldPath: 'dateTaken', direction: 'asc' }],
        limit: 1
      },
    }
  )
  return snapshot.length === 0 ? null : fromFirestore(snapshot[0]);
}

export async function getNewestAlbumItemInAlbum(albumId: string, transaction?: Transaction) {
  const snapshot = await executeQuery<AlbumItemDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS) as CollectionReference<AlbumItemDoc, AlbumItemDoc>,
    {
      transaction,
      queryOptions: {
        orderBy: [{ fieldPath: 'dateTaken', direction: 'desc' }],
        limit: 1
      },
    }
  )
  return snapshot.length === 0 ? null : fromFirestore(snapshot[0]);
}