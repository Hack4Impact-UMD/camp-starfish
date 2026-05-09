import { db } from "@/config/firebase";
import { Session } from "@/types/sessions/sessionTypes";
import { SessionDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
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
import {
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  executeQuery,
} from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<SessionDoc, SessionDoc> | QueryDocumentSnapshot<SessionDoc, SessionDoc>): Session {
  if (!snapshot.exists()) { throw Error("Document not found"); };
  const sessionDoc = snapshot.data();
  return {
    id: snapshot.ref.id,
    name: sessionDoc.name,
    startDate: moment(sessionDoc.startDate.toDate()),
    endDate: moment(sessionDoc.endDate.toDate()),
    driveFolderId: sessionDoc.driveFolderId,
    linkedAlbumId: sessionDoc.linkedAlbumId
  };
}

export async function getSessionDoc(id: string, transaction?: Transaction): Promise<Session> {
  const snapshot = await getDoc<SessionDoc>(doc(db, RootLevelCollection.SESSIONS, id) as DocumentReference<SessionDoc, SessionDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function listSessionDocs(): Promise<Session[]> {
  const snapshots = await executeQuery<SessionDoc>(collection(db, RootLevelCollection.SESSIONS) as CollectionReference<SessionDoc, SessionDoc>);
  return snapshots.map(fromFirestore);
}

export async function createSessionDoc(session: WithFieldValue<SessionDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const sessionId = uuid();
  await setDoc<SessionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId) as DocumentReference<SessionDoc, SessionDoc>, session, { instance });
  return sessionId;
}

export async function updateSessionDoc(id: string, updates: UpdateData<SessionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SessionDoc>(doc(db, RootLevelCollection.SESSIONS, id) as DocumentReference<SessionDoc, SessionDoc>, updates, instance);
}

export async function deleteSessionDoc(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SessionDoc>(doc(db, RootLevelCollection.SESSIONS, id) as DocumentReference<SessionDoc, SessionDoc>, instance);
}