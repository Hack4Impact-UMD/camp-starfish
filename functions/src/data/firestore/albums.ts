import { Album, AlbumID } from "@/types/albumTypes";
import { v4 as uuid } from "uuid";
import { Collection } from "./utils";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";

const albumFirestoreConverter: FirestoreDataConverter<AlbumID, Album> = {
  toFirestore: (album: WithFieldValue<AlbumID>): WithFieldValue<Album> => {
    const { id, ...dto } = album;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Album, Album>): AlbumID => ({ id: snapshot.ref.id, ...snapshot.data() })
};

export async function getAlbumById(id: string, transaction?: Transaction): Promise<AlbumID> {
  return await getDoc<AlbumID, Album>(adminDb.collection(Collection.ALBUMS).doc(id) as DocumentReference<AlbumID, Album>, albumFirestoreConverter, transaction);
}

export async function setAlbum(album: Album, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await setDoc<AlbumID, Album>(adminDb.collection(Collection.ALBUMS).doc(albumId) as DocumentReference<AlbumID, Album>, { id: albumId, ...album }, albumFirestoreConverter, instance);
  return albumId;
}

export async function updateAlbum(id: string, updates: Partial<Album>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumID, Album>(adminDb.collection(Collection.ALBUMS).doc(id) as DocumentReference<AlbumID, Album>, updates, albumFirestoreConverter, instance);
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumID, Album>(adminDb.collection(Collection.ALBUMS).doc(id) as DocumentReference<AlbumID, Album>, albumFirestoreConverter, instance);
}
