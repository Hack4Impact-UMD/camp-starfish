import { adminDb } from "../../config/firebaseAdminConfig";
import { ImageReport, ImageReportID } from "@/types/albumTypes";
import { 
  Transaction, 
  WriteBatch, 
  FirestoreDataConverter, 
  WithFieldValue, 
  QueryDocumentSnapshot, 
  DocumentReference,
  Query
} from "firebase-admin/firestore";
import { getDoc, setDoc, updateDoc, deleteDoc, executeQuery } from "./firestoreAdminOperations";
import { Collection } from "./utils";
import { AlbumsSubcollection, ImageSubcollection } from "@/data/firestore/utils";
import { v4 as uuid } from "uuid";

const reportFirestoreConverter: FirestoreDataConverter<ImageReportID, ImageReport> = {
  toFirestore: (report: WithFieldValue<ImageReportID>): WithFieldValue<ImageReport> => {
    const { id, ...dto } = report;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<ImageReport, ImageReport>): ImageReportID => {
    const imageId = snapshot.ref.parent.parent!.id;
    const albumId = snapshot.ref.parent.parent!.parent.parent!.id;
    return { 
      id: snapshot.ref.id, 
      imageId,
      albumId,
      ...snapshot.data() 
    };
  }
};

export async function getReportById(
  albumId: string, 
  imageId: string, 
  reportId: string, 
  transaction?: Transaction
): Promise<ImageReportID> {
  return await getDoc<ImageReportID, ImageReport>(
    adminDb
      .collection(Collection.ALBUMS)
      .doc(albumId)
      .collection(AlbumsSubcollection.IMAGE_METADATAS)
      .doc(imageId)
      .collection(ImageSubcollection.REPORTS)
      .doc(reportId) as DocumentReference<ImageReportID, ImageReport>, 
    reportFirestoreConverter, 
    transaction
  );
}

export async function getReportsByImageId(
  albumId: string, 
  imageId: string,
  transaction?: Transaction
): Promise<ImageReportID[]> {
  const query = adminDb
    .collection(Collection.ALBUMS)
    .doc(albumId)
    .collection(AlbumsSubcollection.IMAGE_METADATAS)
    .doc(imageId)
    .collection(ImageSubcollection.REPORTS) as Query<ImageReportID, ImageReport>;
  
  return await executeQuery<ImageReportID, ImageReport>(query, reportFirestoreConverter, transaction);
}

export async function createReport(
  albumId: string, 
  imageId: string, 
  report: Omit<ImageReport, 'imageId' | 'albumId'>, 
  instance?: Transaction | WriteBatch
): Promise<string> {
  const reportId = uuid();
  await setDoc<ImageReportID, ImageReport>(
    adminDb
      .collection(Collection.ALBUMS)
      .doc(albumId)
      .collection(AlbumsSubcollection.IMAGE_METADATAS)
      .doc(imageId)
      .collection(ImageSubcollection.REPORTS)
      .doc(reportId) as DocumentReference<ImageReportID, ImageReport>, 
    { 
      id: reportId, 
      imageId, 
      albumId, 
      ...report 
    }, 
    reportFirestoreConverter, 
    instance
  );
  return reportId;
}

export async function updateReport(
  albumId: string, 
  imageId: string, 
  reportId: string, 
  updates: Partial<ImageReport>, 
  instance?: Transaction | WriteBatch
): Promise<void> {
  await updateDoc<ImageReportID, ImageReport>(
    adminDb
      .collection(Collection.ALBUMS)
      .doc(albumId)
      .collection(AlbumsSubcollection.IMAGE_METADATAS)
      .doc(imageId)
      .collection(ImageSubcollection.REPORTS)
      .doc(reportId) as DocumentReference<ImageReportID, ImageReport>, 
    updates, 
    reportFirestoreConverter, 
    instance
  );
}

export async function deleteReport(
  albumId: string, 
  imageId: string, 
  reportId: string, 
  instance?: Transaction | WriteBatch
): Promise<void> {
  await deleteDoc<ImageReportID, ImageReport>(
    adminDb
      .collection(Collection.ALBUMS)
      .doc(albumId)
      .collection(AlbumsSubcollection.IMAGE_METADATAS)
      .doc(imageId)
      .collection(ImageSubcollection.REPORTS)
      .doc(reportId) as DocumentReference<ImageReportID, ImageReport>, 
    reportFirestoreConverter, 
    instance
  );
}