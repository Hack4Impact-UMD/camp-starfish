import { db } from "@/config/firebase";
import { AlbumItemReport } from "@/types/albums/albumTypes";
import { AlbumItemReportDoc } from "./types/documents";
import { 
  doc, 
  collection,
  Transaction, 
  WriteBatch,
  QueryDocumentSnapshot, 
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  WithFieldValue,
  UpdateData
} from "firebase/firestore";
import { getDoc, setDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection, AlbumsSubcollection, AlbumItemsSubcollection } from "./types/collections";
import { v4 as uuid } from "uuid";

function fromFirestore(snapshot: DocumentSnapshot<AlbumItemReportDoc, AlbumItemReportDoc> | QueryDocumentSnapshot<AlbumItemReportDoc, AlbumItemReportDoc>): AlbumItemReport {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: snapshot.ref.id,
    albumItemId: snapshot.ref.parent.parent!.id,
    albumId: snapshot.ref.parent.parent!.parent.parent!.id,
    ...snapshot.data()
  }
}

export async function getAlbumItemReportDocById(albumId: string, imageId: string, reportId: string, transaction?: Transaction): Promise<AlbumItemReport> {
  const snapshot = await getDoc<AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, imageId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>, 
    transaction
  );
  return fromFirestore(snapshot);
}

export async function getAlbumItemReportDocsByAlbumItemId(albumId: string, albumItemId: string): Promise<AlbumItemReport[]> {
  const snapshots = await executeQuery<AlbumItemReportDoc>(
    collection(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS) as CollectionReference<AlbumItemReportDoc, AlbumItemReportDoc>, 
  );
  return snapshots.map(fromFirestore);
}

export async function createAlbumItemReportDoc(albumId: string, albumItemId: string, report: WithFieldValue<AlbumItemReportDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const reportId = uuid();
  await setDoc<AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>, 
    report, 
    { instance }
  );
  return reportId;
}

export async function updateAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, updates: UpdateData<AlbumItemReportDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>, 
    updates, 
    instance
  );
}

export async function deleteAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>, 
    instance
  );
}