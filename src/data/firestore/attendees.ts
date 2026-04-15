import { db } from "@/config/firebase";
import { Attendee } from "@/types/sessions/sessionTypes";
import { AttendeeDoc } from "./types/documents";
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
import { createDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";
import { Collection, SessionsSubcollection } from "./types/collections";

const attendeeFirestoreConverter: FirestoreDataConverter<Attendee, AttendeeDoc> = {
  toFirestore: (attendee: WithFieldValue<Attendee>) => {
    const { attendeeId, sessionId, ...dto } = attendee;
    return dto as WithFieldValue<Attendee>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<AttendeeDoc, AttendeeDoc>): Attendee => ({ attendeeId: Number(snapshot.ref.id), sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data(), })
};

export async function getAttendeeById(campminderId: number, sessionId: string, transaction?: Transaction): Promise<Attendee> {
  return await getDoc<Attendee, AttendeeDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<Attendee, AttendeeDoc>, attendeeFirestoreConverter, transaction);
};

export async function getAttendeesBySessionId(sessionId: string): Promise<Attendee[]> {
  return await executeQuery<Attendee, AttendeeDoc>(collection(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES) as CollectionReference<Attendee, AttendeeDoc>, attendeeFirestoreConverter);
}

export async function createAttendee(campminderId: number, sessionId: string, attendee: AttendeeDoc, instance?: Transaction | WriteBatch): Promise<number> {
  const attendeeId = campminderId;
  await createDoc<Attendee, AttendeeDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<Attendee, AttendeeDoc>, { attendeeId, sessionId: sessionId, ...attendee }, attendeeFirestoreConverter, instance);
  return attendeeId;
}

export async function updateAttendee(campminderId: number, sessionId: string, updates: Partial<AttendeeDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Attendee, AttendeeDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<Attendee, AttendeeDoc>, updates, attendeeFirestoreConverter, instance);
}