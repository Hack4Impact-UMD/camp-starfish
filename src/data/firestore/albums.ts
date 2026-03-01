import { db } from "@/config/firebase";
import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
import { Collection } from "./types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";
import { doc, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase/firestore";

const albumFirestoreConverter: FirestoreDataConverter<Album, AlbumDoc> = {
  toFirestore: (album: WithFieldValue<Album>): WithFieldValue<AlbumDoc> => {
    const { id, ...dto } = album;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album => ({ id: snapshot.ref.id, ...snapshot.data() })
};

export async function getAlbumById(id: string, transaction?: Transaction): Promise<Album> {
  return await getDoc<Album, AlbumDoc>(doc(db, Collection.ALBUMS, id) as DocumentReference<Album, AlbumDoc>, albumFirestoreConverter, transaction);
}

export async function setAlbum(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await setDoc<Album, AlbumDoc>(doc(db, Collection.ALBUMS, albumId) as DocumentReference<Album, AlbumDoc>, { id: albumId, ...album }, albumFirestoreConverter, instance);
  return albumId;
}

export async function updateAlbum(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Album, AlbumDoc>(doc(db, Collection.ALBUMS, id) as DocumentReference<Album, AlbumDoc>, updates, albumFirestoreConverter, instance);
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Album, AlbumDoc>(doc(db, Collection.ALBUMS, id) as DocumentReference<Album, AlbumDoc>, albumFirestoreConverter, instance);
}
