import { db } from "@/config/firebase";
import { AlbumItem } from "@/types/albums/albumTypes";
import { AlbumItemDoc } from "./types/documents";
import { doc, Transaction, WriteBatch, QueryDocumentSnapshot, DocumentReference, DocumentSnapshot, WithFieldValue, UpdateData, getDocs, collection, CollectionReference } from "firebase/firestore";
import { getDoc, setDoc, updateDoc, deleteDoc, executeQuery, mapSnapshotsToPaginatedQueryResult } from "./firestoreClientOperations"
import { PaginatedQueryResponse, QueryOptions } from "./types/queries";
import { AlbumsSubcollection, RootLevelCollection } from "./types/collections";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

function fromFirestore(snapshot: DocumentSnapshot<AlbumItemDoc, AlbumItemDoc> | QueryDocumentSnapshot<AlbumItemDoc, AlbumItemDoc>): AlbumItem {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const albumItemDoc = snapshot.data();
  return {
    id: snapshot.ref.id,
    albumId: snapshot.ref.parent.parent!.id,
    name: albumItemDoc.name,
    dateTaken: moment(albumItemDoc.dateTaken.toMillis()),
    inReview: albumItemDoc.inReview,
    tagIds: albumItemDoc.tagIds,
  }
}

export async function getAlbumItemDoc(albumId: string, albumItemId: string, transaction?: Transaction): Promise<AlbumItem> {
  const snapshot = await getDoc<AlbumItemDoc>(doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function listAlbumItemDocs(albumId: string, queryOptions?: QueryOptions<AlbumItemDoc>): Promise<PaginatedQueryResponse<AlbumItem, AlbumItemDoc>> {
  const snapshots = await executeQuery<AlbumItemDoc>(
    collection(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS) as CollectionReference<AlbumItemDoc, AlbumItemDoc>,
    queryOptions
  )
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createAlbumItemDoc(albumId: string, albumItem: WithFieldValue<AlbumItemDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const albumItemId = uuidv4();
  await setDoc(doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, albumItem, { instance });
  return albumItemId;
}

export async function updateAlbumItemDoc(albumId: string, albumItemId: string, updates: UpdateData<AlbumItemDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemDoc>(doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, updates, instance);
}

export async function deleteAlbumItemDoc(albumId: string, albumItemId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemDoc>(doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId) as DocumentReference<AlbumItemDoc, AlbumItemDoc>, instance);
}