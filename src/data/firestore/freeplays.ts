import { db } from "@/config/firebase";
import { Freeplay } from "@/types/sessions/sessionTypes";
import { FreeplayDoc } from "./types/documents";
import { doc, Transaction, WriteBatch, QueryDocumentSnapshot, DocumentReference, DocumentSnapshot, WithFieldValue, UpdateData } from "firebase/firestore";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { Moment } from "moment";

function fromFirestore(snapshot: DocumentSnapshot<FreeplayDoc, FreeplayDoc> | QueryDocumentSnapshot<FreeplayDoc, FreeplayDoc>): Freeplay {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    date: snapshot.ref.id,
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data()
  };
}

export async function getFreeplayById(sessionId: string, freeplayId: string, transaction?: Transaction): Promise<Freeplay> {
  const snapshot = await getDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<FreeplayDoc, FreeplayDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function createFreeplay(sessionId: string, date: Moment, freeplay: WithFieldValue<FreeplayDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, date.format("YYYY-MM-DD")) as DocumentReference<FreeplayDoc, FreeplayDoc>, freeplay, { instance });
};

export async function updateFreeplay(sessionId: string, freeplayId: string, updates: UpdateData<FreeplayDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<FreeplayDoc, FreeplayDoc>, updates, instance);
};

export async function deleteFreeplay(sessionId: string, freeplayId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<FreeplayDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<FreeplayDoc, FreeplayDoc>, instance);
};
