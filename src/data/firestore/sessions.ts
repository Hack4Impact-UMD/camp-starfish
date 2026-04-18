import { db } from "@/config/firebase";
import { Session } from "@/types/sessions/sessionTypes";
import { SessionDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
import {
  doc,
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
  collection,
  CollectionReference,
  UpdateData
} from "firebase/firestore";
import {
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  executeQuery,
} from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";

const sessionFirestoreConverter: FirestoreDataConverter<Session, SessionDoc> = {
  toFirestore: (
    session: WithFieldValue<Session>
  ): WithFieldValue<SessionDoc> => {
    const { id, ...dto } = session;
    return dto;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<SessionDoc, SessionDoc>
  ): Session => ({ id: snapshot.ref.id, ...snapshot.data() }),
};

export async function getSessionById(id: string, transaction?: Transaction): Promise<Session> {
  return await getDoc<Session, SessionDoc>(doc(db, RootLevelCollection.SESSIONS, id) as DocumentReference<Session, SessionDoc>, sessionFirestoreConverter, transaction);
}

export async function getAllSessions(): Promise<Session[]> {
  return await executeQuery<Session, SessionDoc>(collection(db, RootLevelCollection.SESSIONS) as CollectionReference<Session, SessionDoc>, sessionFirestoreConverter);
}

export type CreateSessionDTO = SessionDoc;
export async function createSession(session: CreateSessionDTO, instance?: Transaction | WriteBatch): Promise<string> {
  const sessionId = uuid();
  await setDoc<Session, SessionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId) as DocumentReference<Session, SessionDoc>, { id: sessionId, ...session }, sessionFirestoreConverter, { instance });
  return sessionId;
}

export async function updateSession(id: string, updates: UpdateData<SessionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Session, SessionDoc>(doc(db, RootLevelCollection.SESSIONS, id) as DocumentReference<Session, SessionDoc>, updates, sessionFirestoreConverter, instance);
}

export async function deleteSession(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Session, SessionDoc>(doc(db, RootLevelCollection.SESSIONS, id) as DocumentReference<Session, SessionDoc>, instance);
}