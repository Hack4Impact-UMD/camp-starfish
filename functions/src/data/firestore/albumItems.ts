import { AlbumItem } from "@/types/albums/albumTypes";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { Transaction, WriteBatch, FirestoreDataConverter, WithFieldValue, QueryDocumentSnapshot, DocumentReference } from "firebase-admin/firestore";
import { getDoc, createDoc, updateDoc, deleteDoc } from "./firestoreAdminOperations"
import { AlbumsSubcollection, Collection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";

const albumItemFirestoreConverter: FirestoreDataConverter<AlbumItem, AlbumItemDoc> = {
  toFirestore: (image: WithFieldValue<AlbumItem>): WithFieldValue<AlbumItemDoc> => {
    const { id, albumId, ...dto } = image;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AlbumItemDoc, AlbumItemDoc>): AlbumItem => ({ id: snapshot.ref.id, albumId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
}

export async function getAlbumItemById(albumId: string, albumItemId: string, transaction?: Transaction): Promise<AlbumItem> {
  return await getDoc<AlbumItem, AlbumItemDoc>(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItem, AlbumItemDoc>, albumItemFirestoreConverter, transaction);
}

export async function createAlbumItem(albumId: string, albumItemId: string, image: AlbumItemDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItem, AlbumItemDoc>, { id: albumItemId, albumId, ...image }, albumItemFirestoreConverter, instance);
}

export async function updateAlbumItem(albumId: string, albumItemId: string, updates: Partial<AlbumItemDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItem, AlbumItemDoc>(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItem, AlbumItemDoc>, updates, albumItemFirestoreConverter, instance);
}

export async function deleteAlbumItem(albumId: string, albumItemId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItem, AlbumItemDoc>(adminDb.collection(Collection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId) as DocumentReference<AlbumItem, AlbumItemDoc>, albumItemFirestoreConverter, instance);
}