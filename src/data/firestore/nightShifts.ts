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
import { setDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";
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

export async function getAllNightShiftsBySessionId(sessionId: string): Promise<NightShiftID[]> {
  return await executeQuery<NightShiftID, NightShift>(collection(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS) as CollectionReference<NightShiftID, NightShift>, nightShiftFirestoreConverter);
}

export async function setNightShift(campminderId: number, sessionId: string, attendee: Attendee, instance?: Transaction | WriteBatch): Promise<number> {
  const attendeeId = campminderId;
  await setDoc<NightShiftID, NightShift>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS, String(campminderId)) as DocumentReference<NightShiftID, NightShift>, { id: attendeeId, sessionId: sessionId, ...attendee }, nightShiftFirestoreConverter, instance);
  return attendeeId;
}

export async function updateNightShift(campminderId: number, sessionId: string, updates: Partial<Attendee>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<NightShiftID, NightShift>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.NIGHT_SHIFTS, String(campminderId)) as DocumentReference<NightShiftID, NightShift>, updates, nightShiftFirestoreConverter, instance);
}