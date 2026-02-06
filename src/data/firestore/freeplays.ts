import { db } from "@/config/firebase";
import { Freeplay } from "@/types/sessions/sessionTypes";
import { FreeplayDoc } from "./types/documents";
import { doc, Transaction, WriteBatch, QueryDocumentSnapshot, FirestoreDataConverter, WithFieldValue, DocumentReference } from "firebase/firestore";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";
import { Collection, SessionsSubcollection } from "./types/collections";

const freeplayFirestoreConverter: FirestoreDataConverter<Freeplay, FreeplayDoc> = {
  toFirestore: (freeplay: WithFieldValue<Freeplay>): WithFieldValue<FreeplayDoc> => {
    const { date, sessionId, ...dto } = freeplay;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<FreeplayDoc, FreeplayDoc>): Freeplay => ({ date: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
};

export async function getFreeplayById(sessionId: string, freeplayId: string, transaction?: Transaction): Promise<Freeplay> {
  return await getDoc<Freeplay, FreeplayDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<Freeplay, FreeplayDoc>, freeplayFirestoreConverter, transaction);
};

export async function setFreeplay(sessionId: string, freeplay: Freeplay, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<Freeplay, FreeplayDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplay.date) as DocumentReference<Freeplay, FreeplayDoc>, freeplay, freeplayFirestoreConverter, instance);
};

export async function updateFreeplay(sessionId: string, freeplayId: string, updates: Partial<FreeplayDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Freeplay, FreeplayDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<Freeplay, FreeplayDoc>, updates, freeplayFirestoreConverter, instance);
};

export async function deleteFreeplay(sessionId: string, freeplayId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Freeplay, FreeplayDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<Freeplay, FreeplayDoc>, freeplayFirestoreConverter, instance);
};
