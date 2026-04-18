import { adminDb } from "../../config/firebaseAdminConfig";
import { AlbumItemReport } from "@/types/albums/albumTypes";
import { AlbumItemReportDoc } from "@/data/firestore/types/documents";
import { 
  Transaction, 
  WriteBatch, 
  FirestoreDataConverter, 
  WithFieldValue, 
  QueryDocumentSnapshot, 
  DocumentReference,
  CollectionReference
} from "firebase-admin/firestore";
import { getDoc, setDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreAdminOperations";
import { RootLevelCollection, AlbumsSubcollection, AlbumItemsSubcollection } from "@/data/firestore/types/collections";
import { v4 as uuid } from "uuid";

const albumItemReportFirestoreConverter: FirestoreDataConverter<AlbumItemReport, AlbumItemReportDoc> = {
  toFirestore: (report: WithFieldValue<AlbumItemReport>): WithFieldValue<AlbumItemReportDoc> => {
    const { id, albumItemId, albumId, ...dto } = report;
    return dto;
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

export async function getAlbumItemReportDocById(albumId: string, albumItemId: string, reportId: string, transaction?: Transaction): Promise<AlbumItemReport> {
  return await getDoc<AlbumItemReport, AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    albumItemReportFirestoreConverter, 
    transaction
  );
}

export async function getAlbumItemReportDocsByImageId(albumId: string, albumItemId: string, transaction?: Transaction): Promise<AlbumItemReport[]> {
  return await executeQuery<AlbumItemReport, AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS) as CollectionReference<AlbumItemReport, AlbumItemReportDoc>,
    albumItemReportFirestoreConverter,
    { transaction }
  );
}

export async function createAlbumItemReportDoc(albumId: string, albumItemId: string, report: AlbumItemReportDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const reportId = uuid();
  await setDoc<AlbumItemReport, AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    { id: reportId, albumItemId, albumId, ...report }, 
    albumItemReportFirestoreConverter, 
    { instance }
  );
  return reportId;
}

export async function updateAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, updates: Partial<AlbumItemReportDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemReport, AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    updates, 
    albumItemReportFirestoreConverter, 
    instance
  );
}

export async function deleteAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemReport, AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReport, AlbumItemReportDoc>, 
    instance
  );
}