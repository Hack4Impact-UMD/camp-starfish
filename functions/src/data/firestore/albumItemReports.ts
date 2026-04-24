import { adminDb } from "../../config/firebaseAdminConfig";
import { AlbumItemReport, PendingAlbumItemReport, ResolvedAlbumItemReport } from "@/types/albums/albumTypes";
import { AlbumItemReportDoc, PendingAlbumItemReportDoc } from "@/data/firestore/types/documents";
import {
  Transaction,
  WriteBatch,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  WithFieldValue,
  UpdateData
} from "firebase-admin/firestore";
import { getDoc, setDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreAdminOperations";
import { RootLevelCollection, AlbumsSubcollection, AlbumItemsSubcollection } from "@/data/firestore/types/collections";
import { v4 as uuid } from "uuid";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<AlbumItemReportDoc, AlbumItemReportDoc> | QueryDocumentSnapshot<AlbumItemReportDoc, AlbumItemReportDoc>): AlbumItemReport {
  if (!snapshot.exists) { throw Error("Document not found"); };
  const albumItemReportDoc = snapshot.data() as AlbumItemReportDoc;
  if (albumItemReportDoc.status === 'PENDING') {
    return {
      id: snapshot.ref.id,
      albumItemId: snapshot.ref.parent.parent!.id,
      albumId: snapshot.ref.parent.parent!.parent.parent!.id,
      status: albumItemReportDoc.status,
      reporterId: albumItemReportDoc.reporterId,
      reportMessage: albumItemReportDoc.reportMessage,
      reportedAt: moment(albumItemReportDoc.reportedAt.toMillis())
    } satisfies PendingAlbumItemReport
  }
  return {
    id: snapshot.ref.id,
    albumItemId: snapshot.ref.parent.parent!.id,
    albumId: snapshot.ref.parent.parent!.parent.parent!.id,
    status: albumItemReportDoc.status,
    reporterId: albumItemReportDoc.reporterId,
    reportMessage: albumItemReportDoc.reportMessage,
    reportedAt: moment(albumItemReportDoc.reportedAt.toMillis()),
    resolverId: albumItemReportDoc.resolverId,
    resolutionMessage: albumItemReportDoc.resolutionMessage,
    resolvedAt: moment(albumItemReportDoc.resolvedAt.toMillis())
  } satisfies ResolvedAlbumItemReport;
}

export async function getAlbumItemReportDocById(albumId: string, albumItemId: string, reportId: string, transaction?: Transaction): Promise<AlbumItemReport> {
  const snapshot = await getDoc<AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>,
    transaction
  );
  return fromFirestore(snapshot);
}

export async function getAlbumItemReportDocsByImageId(albumId: string, albumItemId: string, transaction?: Transaction): Promise<AlbumItemReport[]> {
  const snapshots = await executeQuery<AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS) as CollectionReference<AlbumItemReportDoc, AlbumItemReportDoc>,
    { transaction }
  );
  return snapshots.map(fromFirestore);
}

export async function createAlbumItemReportDoc(albumId: string, albumItemId: string, report: WithFieldValue<AlbumItemReportDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const reportId = uuid();
  await setDoc<AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>,
    report,
    { instance }
  );
  return reportId;
}

export async function updateAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, updates: UpdateData<AlbumItemReportDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>,
    updates,
    instance
  );
}

export async function deleteAlbumItemReportDoc(albumId: string, albumItemId: string, reportId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumItemReportDoc>(
    adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId).collection(AlbumsSubcollection.ALBUM_ITEMS).doc(albumItemId).collection(AlbumItemsSubcollection.REPORTS).doc(reportId) as DocumentReference<AlbumItemReportDoc, AlbumItemReportDoc>,
    instance
  );
}