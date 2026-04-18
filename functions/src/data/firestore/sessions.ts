import { Session } from "@/types/sessions/sessionTypes";
import { SessionDoc } from "@/data/firestore/types/documents";
import { v4 as uuid } from "uuid";
import {
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  UpdateData
} from "firebase-admin/firestore";
import {
  createDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  executeQuery,
} from "./firestoreAdminOperations";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";

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
  return await getDoc<Session, SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(id) as DocumentReference<Session, SessionDoc>, sessionFirestoreConverter, transaction);
}

export async function getAllSessions(): Promise<Session[]> {
  return await executeQuery<Session, SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS) as CollectionReference<Session, SessionDoc>, sessionFirestoreConverter);
}

export type CreateSessionDTO = SessionDoc;
export async function setSession(session: CreateSessionDTO, instance?: Transaction | WriteBatch): Promise<string> {
  const sessionId = uuid();
  await createDoc<Session, SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId) as DocumentReference<Session, SessionDoc>, { id: sessionId, ...session }, sessionFirestoreConverter, instance);
  return sessionId;
}

export async function updateSession(id: string, updates: UpdateData<SessionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Session, SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(id) as DocumentReference<Session, SessionDoc>, updates, sessionFirestoreConverter, instance);
}

export async function deleteSession(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Session, SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(id) as DocumentReference<Session, SessionDoc>, instance);
}