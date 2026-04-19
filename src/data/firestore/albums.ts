import { db } from "@/config/firebase";
import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
import { RootLevelCollection } from "./types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";
import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase/firestore";

function fromFirestore(snapshot: DocumentSnapshot<AlbumDoc, AlbumDoc> | QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: snapshot.ref.id,
    ...snapshot.data(),
  }
}

export async function getAlbumById(id: string, transaction?: Transaction): Promise<Album> {
  const snapshot = await getDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, id) as DocumentReference<AlbumDoc, AlbumDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function getAlbums(): Promise<Album[]> {
  const snapshots = await executeQuery<AlbumDoc>(collection(db, RootLevelCollection.ALBUMS) as CollectionReference<AlbumDoc, AlbumDoc>);
  return snapshots.map(fromFirestore);
}

export async function createAlbum(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await setDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, albumId) as DocumentReference<AlbumDoc, AlbumDoc>, album, { instance });
  return albumId;
}

export async function updateAlbum(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, id) as DocumentReference<AlbumDoc, AlbumDoc>, updates, instance);
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, id) as DocumentReference<AlbumDoc, AlbumDoc>, instance);
}
