import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { v4 as uuid } from "uuid";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { createDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";

const albumFirestoreConverter: FirestoreDataConverter<Album, AlbumDoc> = {
  toFirestore: (album: WithFieldValue<Album>): WithFieldValue<AlbumDoc> => {
    const { id, ...dto } = album;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album => ({ id: snapshot.ref.id, ...snapshot.data() })
};

export async function getAlbumDocById(id: string, transaction?: Transaction): Promise<Album> {
  return await getDoc<Album, AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<Album, AlbumDoc>, albumFirestoreConverter, transaction);
}

export async function createAlbumDoc(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await createDoc<Album, AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId) as DocumentReference<Album, AlbumDoc>, { id: albumId, ...album }, albumFirestoreConverter, instance);
  return albumId;
}

export async function updateAlbumDoc(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Album, AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<Album, AlbumDoc>, updates, albumFirestoreConverter, instance);
}

export async function deleteAlbumDoc(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Album, AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<Album, AlbumDoc>, instance);
}
