import { Session, SessionID } from "@/types/sessionTypes";
import { v4 as uuid } from "uuid";
import {
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
} from "firebase-admin/firestore";
import { Collection } from "./utils";
import { createDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";

const sessionFirestoreConverter: FirestoreDataConverter<SessionID, Session> = {
  toFirestore: (session: WithFieldValue<SessionID>): WithFieldValue<Session> => {
    const { id, ...dto } = session;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Session, Session>): SessionID => ({ id: snapshot.ref.id, ...snapshot.data() })
}

export async function getSessionById(id: string, transaction?: Transaction): Promise<SessionID> {
  return await getDoc<SessionID, Session>(adminDb.collection(Collection.SESSIONS).doc(id) as DocumentReference<SessionID, Session>, sessionFirestoreConverter, transaction);
}

export async function createSession(session: Session, instance?: Transaction | WriteBatch): Promise<string> {
  const sessionId = uuid();
  await createDoc<SessionID, Session>(adminDb.collection(Collection.SESSIONS).doc(sessionId) as DocumentReference<SessionID, Session>, { id: sessionId, ...session }, sessionFirestoreConverter, instance);
  return sessionId;
}

export async function updateSession(id: string, updates: Partial<Session>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SessionID, Session>(adminDb.collection(Collection.SESSIONS).doc(id) as DocumentReference<SessionID, Session>, updates, sessionFirestoreConverter, instance);
}

export async function deleteSession(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SessionID, Session>(adminDb.collection(Collection.SESSIONS).doc(id) as DocumentReference<SessionID, Session>, sessionFirestoreConverter, instance);
}