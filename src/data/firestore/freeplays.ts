import { db } from "@/config/firebase";
import { Freeplay, FreeplayID } from "@/types/sessionTypes";
import { doc, Transaction, WriteBatch, QueryDocumentSnapshot, FirestoreDataConverter, WithFieldValue, DocumentReference } from "firebase/firestore";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";
import { Collection, SessionsSubcollection } from "./utils";

const freeplayFirestoreConverter: FirestoreDataConverter<FreeplayID, Freeplay> = {
  toFirestore: (freeplay: WithFieldValue<FreeplayID>): WithFieldValue<Freeplay> => {
    const { id, sessionId, ...dto } = freeplay;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Freeplay, Freeplay>): FreeplayID => ({ id: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
};

export async function getFreeplayById(sessionId: string, freeplayId: string, transaction?: Transaction): Promise<FreeplayID> {
  return await getDoc<FreeplayID, Freeplay>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<FreeplayID, Freeplay>, freeplayFirestoreConverter, transaction);
};

export async function setFreeplay(sessionId: string, freeplay: FreeplayID, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<FreeplayID, Freeplay>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplay.id) as DocumentReference<FreeplayID, Freeplay>, freeplay, freeplayFirestoreConverter, instance);
};

export async function updateFreeplay(sessionId: string, freeplayId: string, updates: Partial<Freeplay>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<FreeplayID, Freeplay>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<FreeplayID, Freeplay>, updates, freeplayFirestoreConverter, instance);
};

export async function deleteFreeplay(sessionId: string, freeplayId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<FreeplayID, Freeplay>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.FREEPLAYS, freeplayId) as DocumentReference<FreeplayID, Freeplay>, freeplayFirestoreConverter, instance);
};
