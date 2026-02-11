import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { v4 as uuid } from "uuid";
import { Collection } from "@/data/firestore/types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";

const albumFirestoreConverter: FirestoreDataConverter<Album, AlbumDoc> = {
  toFirestore: (album: WithFieldValue<Album>): WithFieldValue<AlbumDoc> => {
    const { id, ...dto } = album;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album => ({ id: snapshot.ref.id, ...snapshot.data() })
};

export async function getAlbumById(id: string, transaction?: Transaction): Promise<Album> {
  return await getDoc<Album, AlbumDoc>(adminDb.collection(Collection.ALBUMS).doc(id) as DocumentReference<Album, AlbumDoc>, albumFirestoreConverter, transaction);
}

export async function setAlbum(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await setDoc<Album, AlbumDoc>(adminDb.collection(Collection.ALBUMS).doc(albumId) as DocumentReference<Album, AlbumDoc>, { id: albumId, ...album }, albumFirestoreConverter, instance);
  return albumId;
}

export async function updateAlbum(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Album, AlbumDoc>(adminDb.collection(Collection.ALBUMS).doc(id) as DocumentReference<Album, AlbumDoc>, updates, albumFirestoreConverter, instance);
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Album, AlbumDoc>(adminDb.collection(Collection.ALBUMS).doc(id) as DocumentReference<Album, AlbumDoc>, albumFirestoreConverter, instance);
}
