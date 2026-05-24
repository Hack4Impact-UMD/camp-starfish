import { Session } from "@/types/sessions/sessionTypes";
import { SessionDoc } from "@/data/firestore/types/documents";
import { v4 as uuid } from "uuid";
import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  UpdateData,
  DocumentSnapshot,
  WithFieldValue
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
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<SessionDoc, SessionDoc> | QueryDocumentSnapshot<SessionDoc, SessionDoc>): Session {
  if (!snapshot.exists) { throw Error("Document not found"); };
  const sessionDoc = snapshot.data() as SessionDoc;
  return {
    id: snapshot.ref.id,
    name: sessionDoc.name,
    startDate: moment(sessionDoc.startDate.toDate()),
    endDate: moment(sessionDoc.endDate.toDate()),
    driveFolderId: sessionDoc.driveFolderId,
    linkedAlbumId: sessionDoc.linkedAlbumId
  };}

export async function getSessionDoc(id: string, transaction?: Transaction): Promise<Session> {
  const snapshot = await getDoc<SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(id) as DocumentReference<SessionDoc, SessionDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function listSessionDocs(): Promise<Session[]> {
  const snapshots = await executeQuery<SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS) as CollectionReference<SessionDoc, SessionDoc>);
  return snapshots.map(fromFirestore);
}

export async function setSessionDoc(session: WithFieldValue<SessionDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const sessionId = uuid();
  await createDoc<SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId) as DocumentReference<SessionDoc, SessionDoc>, session, instance);
  return sessionId;
}

export async function updateSessionDoc(id: string, updates: UpdateData<SessionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(id) as DocumentReference<SessionDoc, SessionDoc>, updates, instance);
}

export async function deleteSessionDoc(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SessionDoc>(adminDb.collection(RootLevelCollection.SESSIONS).doc(id) as DocumentReference<SessionDoc, SessionDoc>, instance);
}