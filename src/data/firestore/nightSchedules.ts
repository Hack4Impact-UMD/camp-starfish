import { db } from "@/config/firebase";
import { NightSchedule } from "@/types/sessions/sessionTypes";
import { NightScheduleDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  collection,
  CollectionReference,
  UpdateData,
  DocumentSnapshot,
  WithFieldValue
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, executeQuery, deleteDoc, mapSnapshotsToPaginatedQueryResult } from "./firestoreClientOperations";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { Moment } from "moment";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<NightScheduleDoc, NightScheduleDoc> | QueryDocumentSnapshot<NightScheduleDoc, NightScheduleDoc>): NightSchedule {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    date: snapshot.ref.id,
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data()
  }
}

export async function getNightScheduleDoc(date: Moment, sessionId: string, transaction?: Transaction): Promise<NightSchedule> {
  const snapshot = await getDoc<NightScheduleDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, date.format("YYYY-MM-DD")) as DocumentReference<NightScheduleDoc, NightScheduleDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function listNightScheduleDocs(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<NightScheduleDoc>): Promise<PaginatedQueryResponse<NightSchedule, NightScheduleDoc>> {
  const snapshots = await executeQuery<NightScheduleDoc>(collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES) as CollectionReference<NightScheduleDoc, NightScheduleDoc>, firestoreQueryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createNightScheduleDoc(sessionId: string, date: Moment, nightShift: WithFieldValue<NightScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<NightScheduleDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, date.format("YYYY-MM-DD")) as DocumentReference<NightScheduleDoc, NightScheduleDoc>, nightShift, { instance });
}

export async function updateNightScheduleDoc(date: Moment, sessionId: string, updates: UpdateData<NightScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<NightScheduleDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, date.format("YYYY-MM-DD")) as DocumentReference<NightScheduleDoc, NightScheduleDoc>, updates, instance);
}

export async function deleteNightScheduleDoc(date: Moment, sessionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<NightScheduleDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, date.format("YYYY-MM-DD")) as DocumentReference<NightScheduleDoc, NightScheduleDoc>, instance);
}