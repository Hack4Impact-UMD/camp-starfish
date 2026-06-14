import { DaysOffScheduleDoc } from "@/data/firestore/types/documents";
import { DaysOffSchedule } from "@/types/sessions/sessionTypes";
import { RootLevelCollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import { deleteDoc, executeQuery, FirestoreQueryOptions, getDoc, mapSnapshotsToPaginatedQueryResult, PaginatedQueryResponse, setDoc, updateDoc } from "./firestoreAdminOperations";
import moment from "moment";
import { CollectionReference, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";


function fromFirestore(snapshot: DocumentSnapshot<DaysOffScheduleDoc, DaysOffScheduleDoc> | QueryDocumentSnapshot<DaysOffScheduleDoc, DaysOffScheduleDoc>): DaysOffSchedule {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const daysOffDoc = snapshot.data() as DaysOffScheduleDoc;
  return {
    sessionId: snapshot.ref.parent.parent!.id,
    daysOffInSession: daysOffDoc.daysOffInSession.map(d => moment(d.toDate())),
    daysOffByCounselorId: Object.keys(daysOffDoc.daysOffByCounselorId).reduce((acc, counselorId) => ({ ...acc, [counselorId]: daysOffDoc.daysOffByCounselorId[Number(counselorId)].map(d => moment(d.toDate())) }), {}),
  }
}

function getDaysOffScheduleDocRef(sessionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.DAYS_OFF_SCHEDULE).doc(SessionsSubcollection.DAYS_OFF_SCHEDULE) as DocumentReference<DaysOffScheduleDoc, DaysOffScheduleDoc>;
}

function getDaysOffScheduleCollectionRef(sessionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.DAYS_OFF_SCHEDULE) as CollectionReference<DaysOffScheduleDoc, DaysOffScheduleDoc>;
}

export async function getDaysOffScheduleDoc(sessionId: string, transaction?: Transaction): Promise<DaysOffSchedule> {
  const snapshot = await getDoc<DaysOffScheduleDoc>(getDaysOffScheduleDocRef(sessionId), transaction);
  return fromFirestore(snapshot);
}

export async function listDaysOffScheduleDocs(sessionId: string, queryOptions?: FirestoreQueryOptions<DaysOffScheduleDoc>): Promise<PaginatedQueryResponse<DaysOffSchedule, DaysOffScheduleDoc>> {
  const snapshots = await executeQuery<DaysOffScheduleDoc>(getDaysOffScheduleCollectionRef(sessionId), { queryOptions });
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