import { db } from "@/config/firebase";
import { ImageReport, ImageReportID } from "@/types/albumTypes";
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
import { Collection, AlbumsSubcollection, ImageSubcollection } from "./utils";
import { v4 as uuid } from "uuid";

const reportFirestoreConverter: FirestoreDataConverter<ImageReportID, ImageReport> = {
  toFirestore: (report: WithFieldValue<ImageReportID>): WithFieldValue<ImageReport> => {
    const { id, imageId, albumId, ...dto } = report;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<ImageReport, ImageReport>): ImageReportID => {
    return ({ id: snapshot.ref.id, imageId: snapshot.ref.parent.parent!.id, albumId: snapshot.ref.parent.parent!.parent.parent!.id, ...snapshot.data() } as ImageReportID);
  }
};

export async function getReportById(
  albumId: string, 
  imageId: string, 
  reportId: string, 
  transaction?: Transaction
): Promise<ImageReportID> {
  return await getDoc<ImageReportID, ImageReport>(
    doc(
      db, 
      Collection.ALBUMS, 
      albumId, 
      AlbumsSubcollection.IMAGE_METADATAS, 
      imageId, 
      ImageSubcollection.REPORTS, 
      reportId
    ) as DocumentReference<ImageReportID, ImageReport>, 
    reportFirestoreConverter, 
    transaction
  );
}

export async function getReportsByImageId(
  albumId: string, 
  imageId: string
): Promise<ImageReportID[]> {
  return await executeQuery<ImageReportID, ImageReport>(
    collection(
      db, 
      Collection.ALBUMS, 
      albumId, 
      AlbumsSubcollection.IMAGE_METADATAS, 
      imageId, 
      ImageSubcollection.REPORTS
    ) as CollectionReference<ImageReportID, ImageReport>, 
    reportFirestoreConverter
  );
}

export async function createReport(
  albumId: string, 
  imageId: string, 
  report: Omit<ImageReport, 'imageId' | 'albumId'>, 
  instance?: Transaction | WriteBatch
): Promise<string> {
  const reportId = uuid();
  await setDoc<ImageReportID, ImageReport>(
    doc(
      db, 
      Collection.ALBUMS, 
      albumId, 
      AlbumsSubcollection.IMAGE_METADATAS, 
      imageId, 
      ImageSubcollection.REPORTS, 
      reportId
    ) as DocumentReference<ImageReportID, ImageReport>, 
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
    doc(
      db, 
      Collection.ALBUMS, 
      albumId, 
      AlbumsSubcollection.IMAGE_METADATAS, 
      imageId, 
      ImageSubcollection.REPORTS, 
      reportId
    ) as DocumentReference<ImageReportID, ImageReport>, 
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
    doc(
      db, 
      Collection.ALBUMS, 
      albumId, 
      AlbumsSubcollection.IMAGE_METADATAS, 
      imageId, 
      ImageSubcollection.REPORTS, 
      reportId
    ) as DocumentReference<ImageReportID, ImageReport>, 
    reportFirestoreConverter, 
    instance
  );
}