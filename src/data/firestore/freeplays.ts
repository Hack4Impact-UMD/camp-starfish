import { db } from "@/config/firebase";
import { Freeplay } from "@/types/sessions/sessionTypes";
import { FreeplayDoc } from "./types/documents";
import { doc, Transaction, WriteBatch, QueryDocumentSnapshot, DocumentReference, DocumentSnapshot, WithFieldValue, UpdateData, CollectionReference, collection } from "firebase/firestore";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery, mapSnapshotsToPaginatedQueryResult } from "./firestoreClientOperations";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { Moment } from "moment";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<FreeplayDoc, FreeplayDoc> | QueryDocumentSnapshot<FreeplayDoc, FreeplayDoc>): Freeplay {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    date: snapshot.ref.id,
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data()
  };
}

export async function getFreeplayDoc(sessionId: string, date: Moment, transaction?: Transaction): Promise<Freeplay> {
  const snapshot = await getDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, date.format("YYYY-MM-DD")) as DocumentReference<FreeplayDoc, FreeplayDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function listFreeplayDocs(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<FreeplayDoc> = {}): Promise<PaginatedQueryResponse<Freeplay, FreeplayDoc>> {
  const snapshots = await executeQuery<FreeplayDoc>(collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS) as CollectionReference<FreeplayDoc, FreeplayDoc>, firestoreQueryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createFreeplay(sessionId: string, date: Moment, freeplay: WithFieldValue<FreeplayDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, date.format("YYYY-MM-DD")) as DocumentReference<FreeplayDoc, FreeplayDoc>, freeplay, { instance });
};

export async function updateFreeplay(sessionId: string, date: Moment, updates: UpdateData<FreeplayDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, date.format("YYYY-MM-DD")) as DocumentReference<FreeplayDoc, FreeplayDoc>, updates, instance);
};

export async function deleteFreeplay(sessionId: string, date: Moment, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, date.format("YYYY-MM-DD")) as DocumentReference<FreeplayDoc, FreeplayDoc>, instance);
};
