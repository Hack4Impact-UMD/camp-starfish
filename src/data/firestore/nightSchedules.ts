import { db } from "@/config/firebase";
import { NightSchedule } from "@/types/sessions/sessionTypes";
import { NightScheduleDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentReference,
  collection,
  CollectionReference
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, executeQuery, deleteDoc } from "./firestoreClientOperations";
import { Collection, SessionsSubcollection } from "./types/collections";

const nightScheduleFirestoreConverter: FirestoreDataConverter<NightSchedule, NightScheduleDoc> = {
  toFirestore: (nightShift: WithFieldValue<NightSchedule>) => {
    const { date, sessionId, ...dto } = nightShift;
    return dto as WithFieldValue<NightSchedule>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<NightScheduleDoc, NightScheduleDoc>): NightSchedule => ({ date: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
};

export async function getNightScheduleById(id: string, sessionId: string, transaction?: Transaction): Promise<NightSchedule> {
  return await getDoc<NightSchedule, NightScheduleDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, id) as DocumentReference<NightSchedule, NightScheduleDoc>, nightScheduleFirestoreConverter, transaction);
};

export async function getNightSchedulesBySessionId(sessionId: string): Promise<NightSchedule[]> {
  return await executeQuery<NightSchedule, NightScheduleDoc>(collection(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES) as CollectionReference<NightSchedule, NightScheduleDoc>, nightScheduleFirestoreConverter);
}

export async function setNightSchedule(date: string, sessionId: string, nightShift: NightScheduleDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<NightSchedule, NightScheduleDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, date) as DocumentReference<NightSchedule, NightScheduleDoc>, { date, sessionId, ...nightShift }, nightScheduleFirestoreConverter, instance);
}

export async function updateNightSchedule(id: string, sessionId: string, updates: Partial<NightScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<NightSchedule, NightScheduleDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, id) as DocumentReference<NightSchedule, NightScheduleDoc>, updates, nightScheduleFirestoreConverter, instance);
}

export async function deleteNightSchedule(id: string, sessionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<NightSchedule, NightScheduleDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SCHEDULES, id) as DocumentReference<NightSchedule, NightScheduleDoc>, nightScheduleFirestoreConverter, instance);
}