import { db } from "@/config/firebase";
import { AlbumItemReport } from "@/types/albums/albumTypes";
import { AlbumItemReportDoc } from "./types/documents";
import { 
  doc, 
  collection,
  Transaction, 
  WriteBatch, 
  FirestoreDataConverter, 
  WithFieldValue, 
  QueryDocumentSnapshot, 
  DocumentReference,
  CollectionReference
} from "firebase/firestore";
import { getDoc, setDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection, AlbumsSubcollection, AlbumItemsSubcollection } from "./types/collections";
import { v4 as uuid } from "uuid";

const albumItemReportFirestoreConverter: FirestoreDataConverter<AlbumItemReport, AlbumItemReportDoc> = {
  toFirestore: (report: WithFieldValue<AlbumItemReport>): WithFieldValue<AlbumItemReportDoc> => {
    const { id, albumItemId, albumId, ...entity } = report;
    return entity;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AlbumItemReportDoc, AlbumItemReportDoc>): AlbumItemReport => {
    return ({
      id: snapshot.ref.id,
      albumItemId: snapshot.ref.parent.parent!.id,
      albumId: snapshot.ref.parent.parent!.parent.parent!.id,
      ...snapshot.data()
    });
  }
};

export async function getAlbumItemReportDocById(albumId: string, imageId: string, reportId: string, transaction?: Transaction): Promise<AlbumItemReport> {
  return await getDoc<AlbumItemReport, AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, imageId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    albumItemReportFirestoreConverter, 
    transaction
  );
}

export async function getAlbumItemReportDocsByAlbumItemId(albumId: string, albumItemId: string): Promise<AlbumItemReport[]> {
  return await executeQuery<AlbumItemReport, AlbumItemReportDoc>(
    collection(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS) as CollectionReference<AlbumItemReport, AlbumItemReportDoc>, 
    albumItemReportFirestoreConverter,
  );
}

export async function createAlbumItemReportDoc(albumId: string, albumItemId: string, report: AlbumItemReportDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const reportId = uuid();
  await setDoc<AlbumItemReport, AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    { id: reportId, albumItemId, albumId, ...report }, 
    albumItemReportFirestoreConverter, 
    { instance }
  );
  return reportId;
}

export async function updateAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, updates: Partial<AlbumItemReportDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemReport, AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    updates, 
    albumItemReportFirestoreConverter, 
    instance
  );
}

export async function deleteAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemReport, AlbumItemReportDoc>(
    doc(db, RootLevelCollection.ALBUMS, albumId, AlbumsSubcollection.ALBUM_ITEMS, albumItemId, AlbumItemsSubcollection.REPORTS, reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    instance
  );
}