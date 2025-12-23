import { db } from "@/config/firebase";
import { AttendeeID, Attendee, NightShiftID, NightShift } from "@/types/sessionTypes";
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
import { Collection, SessionsSubcollection } from "./utils";

const nightShiftFirestoreConverter: FirestoreDataConverter<NightShiftID, NightShift> = {
  toFirestore: (nightShift: WithFieldValue<NightShiftID>) => {
    const { id, sessionId, ...dto } = nightShift;
    return dto as WithFieldValue<NightShiftID>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<NightShift, NightShift>): NightShiftID => ({ id: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
};

export async function getNightShiftById(id: string, sessionId: string, transaction?: Transaction): Promise<NightShiftID> {
  return await getDoc<NightShiftID, NightShift>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS, id) as DocumentReference<NightShiftID, NightShift>, nightShiftFirestoreConverter, transaction);
};

export async function getNightShiftsBySessionId(sessionId: string): Promise<NightShiftID[]> {
  return await executeQuery<NightShiftID, NightShift>(collection(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS) as CollectionReference<NightShiftID, NightShift>, nightShiftFirestoreConverter);
}

export async function setNightShift(id: string, sessionId: string, nightShift: NightShift, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<NightShiftID, NightShift>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS, id) as DocumentReference<NightShiftID, NightShift>, { id, sessionId, ...nightShift }, nightShiftFirestoreConverter, instance);
}

export async function updateNightShift(id: string, sessionId: string, updates: Partial<NightShift>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<NightShiftID, NightShift>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS, id) as DocumentReference<NightShiftID, NightShift>, updates, nightShiftFirestoreConverter, instance);
}

export async function deleteNightShift(id: string, sessionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<NightShiftID, NightShift>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS, id) as DocumentReference<NightShiftID, NightShift>, nightShiftFirestoreConverter, instance);
}