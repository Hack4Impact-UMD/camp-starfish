import { db } from "@/config/firebase";
import { AttendeeID, CamperAttendeeID, StaffAttendeeID, AdminAttendeeID, Attendee } from "@/types/sessionTypes";
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
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";
import { Collection, SessionsSubcollection } from "./utils";
import { v4 as uuid } from "uuid";

// Generic Firestore converter for any Attendee
const attendeeFirestoreConverter: FirestoreDataConverter<AttendeeID, Attendee> = {
  toFirestore: (attendee: WithFieldValue<AttendeeID>) => {
    const { id, sessionId, ...dto } = attendee;
    return dto as WithFieldValue<AttendeeID>; 
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Attendee, Attendee>): AttendeeID => ({ id: Number(snapshot.ref.id), sessionId: snapshot.ref.parent.id, ...snapshot.data() as Attendee })

};

// Get attendedee by id
export async function getAttendeeById(campminderId: number, sessionId: string, transaction?: Transaction): Promise<AttendeeID> {
    return await getDoc<AttendeeID, Attendee>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<AttendeeID, Attendee>, attendeeFirestoreConverter, transaction);
};

export async function getAllAttendees(sessionId: string): Promise<AttendeeID[]> {
  return await executeQuery<AttendeeID, Attendee>(collection(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES) as CollectionReference<AttendeeID, Attendee>, attendeeFirestoreConverter);
}

export async function setAttendee(campminderId: number, sessionId: string, attendee: Attendee, instance?: Transaction | WriteBatch): Promise<number> {
  const attendedeeId = campminderId;
  await setDoc<AttendeeID, Attendee>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<AttendeeID, Attendee>, { id: attendedeeId, sessionId: sessionId, ...attendee }, attendeeFirestoreConverter, instance);
  return attendedeeId;
}

export async function updateAttendee(campminderId: number, sessionId: string, updates: Partial<Attendee>, instance?: Transaction | WriteBatch): Promise<void>{
  await updateDoc<AttendeeID, Attendee>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.ATTENDEES, String(campminderId)) as DocumentReference<AttendeeID, Attendee>, updates, attendeeFirestoreConverter, instance);
}

