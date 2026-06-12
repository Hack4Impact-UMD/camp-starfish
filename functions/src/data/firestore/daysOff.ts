import { DaysOffDoc } from "@/data/firestore/types/documents";
import { DaysOff } from "@/types/sessions/sessionTypes";
import { RootLevelCollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import { deleteDoc, executeQuery, FirestoreQueryOptions, getDoc, mapSnapshotsToPaginatedQueryResult, PaginatedQueryResponse, setDoc, updateDoc } from "./firestoreAdminOperations";
import moment from "moment";
import { CollectionReference, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";


function fromFirestore(snapshot: DocumentSnapshot<DaysOffDoc, DaysOffDoc> | QueryDocumentSnapshot<DaysOffDoc, DaysOffDoc>): DaysOff {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const daysOffDoc = snapshot.data() as DaysOffDoc;
  return {
    sessionId: snapshot.ref.parent.parent!.id,
    daysOffInSession: daysOffDoc.daysOffInSession.map(d => moment(d.toDate())),
    daysOffByCounselorId: Object.keys(daysOffDoc.daysOffByCounselorId).reduce((acc, counselorId) => ({ ...acc, [counselorId]: daysOffDoc.daysOffByCounselorId[Number(counselorId)].map(d => moment(d.toDate())) }), {}),
  }
}

function getDaysOffDocRef(sessionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.DAYS_OFF).doc(SessionsSubcollection.DAYS_OFF) as DocumentReference<DaysOffDoc, DaysOffDoc>;
}

function getDaysOffCollectionRef(sessionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.DAYS_OFF) as CollectionReference<DaysOffDoc, DaysOffDoc>;
}

export async function getDaysOffDoc(sessionId: string, transaction?: Transaction): Promise<DaysOff> {
  const snapshot = await getDoc<DaysOffDoc>(getDaysOffDocRef(sessionId), transaction);
  return fromFirestore(snapshot);
}

export async function listDaysOffDocs(sessionId: string, queryOptions?: FirestoreQueryOptions<DaysOffDoc>): Promise<PaginatedQueryResponse<DaysOff, DaysOffDoc>> {
  const snapshots = await executeQuery<DaysOffDoc>(getDaysOffCollectionRef(sessionId), { queryOptions });
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