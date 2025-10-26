import { db } from "@/config/firebase";
import { Album, AlbumID } from "@/types/albumTypes";
import { v4 as uuid } from "uuid";
import { Collection } from "./utils";
import { createDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";
import { doc, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, WithFieldValue, WriteBatch } from "firebase/firestore";

const albumFirestoreConverter: FirestoreDataConverter<AlbumID, Album> = {
  toFirestore: (album: WithFieldValue<AlbumID>): WithFieldValue<Album> => {
    const { id, ...dto } = album;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Album, Album>): AlbumID => ({ id: snapshot.ref.id, ...snapshot.data() })
};

export async function getAlbumById(id: string, transaction?: Transaction): Promise<AlbumID> {
  return await getDoc<AlbumID, Album>(doc(db, Collection.ALBUMS, id) as DocumentReference<AlbumID, Album>, albumFirestoreConverter, transaction);
}

export async function createAlbum(album: Album, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await createDoc<AlbumID, Album>(doc(db, Collection.ALBUMS, albumId) as DocumentReference<AlbumID, Album>, { id: albumId, ...album }, albumFirestoreConverter, instance);
  return albumId;
}

export async function updateAlbum(id: string, updates: Partial<Album>, instance?: Transaction | WriteBatch) {
  await updateDoc<AlbumID, Album>(doc(db, Collection.ALBUMS, id) as DocumentReference<AlbumID, Album>, updates, albumFirestoreConverter, instance);
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch) {
  await deleteDoc<AlbumID, Album>(doc(db, Collection.ALBUMS, id) as DocumentReference<AlbumID, Album>, albumFirestoreConverter, instance);
}
