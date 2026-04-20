import { db } from "@/config/firebase";
import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
import { RootLevelCollection } from "./types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery, QueryOptions, mapSnapshotsToPaginatedQueryResult, PaginatedQueryResponse } from "./firestoreClientOperations";
import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase/firestore";

function fromFirestore(snapshot: DocumentSnapshot<AlbumDoc, AlbumDoc> | QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: snapshot.ref.id,
    ...snapshot.data(),
  }
}

export async function getAlbumDocById(id: string, transaction?: Transaction): Promise<Album> {
  const snapshot = await getDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, id) as DocumentReference<AlbumDoc, AlbumDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function getAlbumDocs(queryOptions?: QueryOptions<AlbumDoc>): Promise<PaginatedQueryResponse<Album, AlbumDoc>> {
  const snapshots = await executeQuery<AlbumDoc>(collection(db, RootLevelCollection.ALBUMS) as CollectionReference<AlbumDoc, AlbumDoc>, queryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createAlbumDoc(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await setDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, albumId) as DocumentReference<AlbumDoc, AlbumDoc>, album, { instance });
  return albumId;
}

export async function updateAlbumDoc(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, id) as DocumentReference<AlbumDoc, AlbumDoc>, updates, instance);
}

export async function deleteAlbumDoc(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumDoc>(doc(db, RootLevelCollection.ALBUMS, id) as DocumentReference<AlbumDoc, AlbumDoc>, instance);
}
