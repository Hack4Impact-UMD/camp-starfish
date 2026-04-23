import { AlbumItem } from "@/types/albums/albumTypes";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { Transaction, WriteBatch, QueryDocumentSnapshot, DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";
import { getDoc, createDoc, updateDoc, deleteDoc } from "./firestoreAdminOperations"
import { AlbumsSubcollection, RootLevelCollection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";
import moment from "moment";

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

export async function getAlbumItemById(albumId: string, albumItemId: string, transaction?: Transaction): Promise<AlbumItem> {
  const snapshot = await getDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function createAlbumItem(albumId: string, albumItemId: string, albumItem: AlbumItemDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, albumItem, instance);
}

export async function updateAlbumItem(albumId: string, albumItemId: string, updates: Partial<AlbumItemDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, updates, instance);
}

export async function deleteAlbumItem(albumId: string, albumItemId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, instance);
}