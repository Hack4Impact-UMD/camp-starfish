import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase/firestore";
import { DaysOffScheduleDoc } from "./types/documents";
import { DaysOffSchedule } from "@/types/sessions/sessionTypes";
import { db } from "@/config/firebase";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc } from "./firestoreClientOperations";
import moment from "moment";


function fromFirestore(snapshot: DocumentSnapshot<DaysOffScheduleDoc, DaysOffScheduleDoc> | QueryDocumentSnapshot<DaysOffScheduleDoc, DaysOffScheduleDoc>): DaysOffSchedule {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const daysOffDoc = snapshot.data();
  return {
    sessionId: snapshot.ref.parent.parent!.id,
    daysOffInSession: daysOffDoc.daysOffInSession.map(d => moment(d.toDate())),
    daysOffByCounselorId: Object.keys(daysOffDoc.daysOffByCounselorId).reduce((acc, counselorId) => ({ ...acc, [counselorId]: daysOffDoc.daysOffByCounselorId[Number(counselorId)].map(d => moment(d.toDate())) }), {}),
  }
}

function getDaysOffScheduleDocRef(sessionId: string) {
  return doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.DAYS_OFF_SCHEDULE, SessionsSubcollection.DAYS_OFF_SCHEDULE) as DocumentReference<DaysOffScheduleDoc, DaysOffScheduleDoc>;
}

function getDaysOffScheduleCollectionRef(sessionId: string) {
  return collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.DAYS_OFF_SCHEDULE) as CollectionReference<DaysOffScheduleDoc, DaysOffScheduleDoc>;
}

export async function getDaysOffScheduleDoc(sessionId: string, transaction?: Transaction): Promise<DaysOffSchedule> {
  const snapshot = await getDoc<DaysOffScheduleDoc>(getDaysOffScheduleDocRef(sessionId), transaction);
  return fromFirestore(snapshot);
}

export async function listDaysOffScheduleDocs(sessionId: string, queryOptions?: FirestoreQueryOptions<DaysOffScheduleDoc>): Promise<PaginatedQueryResponse<DaysOffSchedule, DaysOffScheduleDoc>> {
  const snapshots = await executeQuery<DaysOffScheduleDoc>(getDaysOffScheduleCollectionRef(sessionId), queryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createDaysOffScheduleDoc(sessionId: string, daysOff: WithFieldValue<DaysOffScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc(getDaysOffScheduleDocRef(sessionId), daysOff, { instance });
}

export async function updateDaysOffScheduleDoc(sessionId: string, updates: UpdateData<DaysOffScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<DaysOffScheduleDoc>(getDaysOffScheduleDocRef(sessionId), updates, instance);
}

export async function deleteDaysOffScheduleDoc(sessionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<DaysOffScheduleDoc>(getDaysOffScheduleDocRef(sessionId), instance);
}