import { db } from "@/config/firebase";
import { Session, SessionID } from "@/types/sessionTypes";
import { v4 as uuid } from "uuid";
import {
  doc,
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
  getDoc as getDocFirestore,
} from "firebase/firestore";
import { Collection } from "./utils";
import {
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "./firestoreClientOperations";
import { QueryFunctionContext } from '@tanstack/react-query';


const sessionFirestoreConverter: FirestoreDataConverter<SessionID, Session> = {
  toFirestore: (
    session: WithFieldValue<SessionID>
  ): WithFieldValue<Session> => {
    const { id, ...dto } = session;
    return dto;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<Session, Session>
  ): SessionID => ({ id: snapshot.ref.id, ...snapshot.data() }),
};

export async function getSessionById(
  id: string,
  transaction?: Transaction
): Promise<SessionID> {
  return await getDoc<SessionID, Session>(
    doc(db, Collection.SESSIONS, id) as DocumentReference<SessionID, Session>,
    sessionFirestoreConverter,
    transaction
  );
}

export async function setSession(
  session: Session,
  instance?: Transaction | WriteBatch
): Promise<string> {
  const sessionId = uuid();
  await setDoc<SessionID, Session>(
    doc(db, Collection.SESSIONS, sessionId) as DocumentReference<
      SessionID,
      Session
    >,
    { id: sessionId, ...session },
    sessionFirestoreConverter,
    instance
  );
  return sessionId;
}

export async function updateSession(
  id: string,
  updates: Partial<Session>,
  instance?: Transaction | WriteBatch
): Promise<void> {
  await updateDoc<SessionID, Session>(
    doc(db, Collection.SESSIONS, id) as DocumentReference<SessionID, Session>,
    updates,
    sessionFirestoreConverter,
    instance
  );
}

export async function deleteSession(
  id: string,
  instance?: Transaction | WriteBatch
): Promise<void> {
  await deleteDoc<SessionID, Session>(
    doc(db, Collection.SESSIONS, id) as DocumentReference<SessionID, Session>,
    sessionFirestoreConverter,
    instance
  );
}

export async function getSessionDates({ queryKey } : { queryKey: [string, string] }) {
  const [_, sessionID] = queryKey
  const sessionRef = doc(db, "sessions", sessionID);
  const sessionSnap = await getDocFirestore(sessionRef);
  if (!sessionSnap.exists()) throw new Error("Session does not exist");
  const sessionData = sessionSnap.data() as Session;
  return { startDate: sessionData.startDate, endDate: sessionData.endDate };
}
