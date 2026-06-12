import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase/firestore";
import { DaysOffDoc } from "./types/documents";
import { DaysOff } from "@/types/sessions/sessionTypes";
import { db } from "@/config/firebase";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc } from "./firestoreClientOperations";
import moment from "moment";


function fromFirestore(snapshot: DocumentSnapshot<DaysOffDoc, DaysOffDoc> | QueryDocumentSnapshot<DaysOffDoc, DaysOffDoc>): DaysOff {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const daysOffDoc = snapshot.data();
  return {
    sessionId: snapshot.ref.parent.parent!.id,
    daysOffInSession: daysOffDoc.daysOffInSession.map(d => moment(d.toDate())),
    daysOffByCounselorId: Object.keys(daysOffDoc.daysOffByCounselorId).reduce((acc, counselorId) => ({ ...acc, [counselorId]: daysOffDoc.daysOffByCounselorId[Number(counselorId)].map(d => moment(d.toDate())) }), {}),
  }
}

function getDaysOffDocRef(sessionId: string) {
  return doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.DAYS_OFF, SessionsSubcollection.DAYS_OFF) as DocumentReference<DaysOffDoc, DaysOffDoc>;
}

function getDaysOffCollectionRef(sessionId: string) {
  return collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.DAYS_OFF) as CollectionReference<DaysOffDoc, DaysOffDoc>;
}

export async function getDaysOffDoc(sessionId: string, transaction?: Transaction): Promise<DaysOff> {
  const snapshot = await getDoc<DaysOffDoc>(getDaysOffDocRef(sessionId), transaction);
  return fromFirestore(snapshot);
}

export async function listDaysOffDocs(sessionId: string, queryOptions?: FirestoreQueryOptions<DaysOffDoc>): Promise<PaginatedQueryResponse<DaysOff, DaysOffDoc>> {
  const snapshots = await executeQuery<DaysOffDoc>(getDaysOffCollectionRef(sessionId), queryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createDaysOffDoc(sessionId: string, daysOff: WithFieldValue<DaysOffDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc(getDaysOffDocRef(sessionId), daysOff, { instance });
}

export async function updateDaysOffDoc(sessionId: string, updates: UpdateData<DaysOffDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<DaysOffDoc>(getDaysOffDocRef(sessionId), updates, instance);
}

export async function deleteDaysOffDoc(sessionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<DaysOffDoc>(getDaysOffDocRef(sessionId), instance);
}