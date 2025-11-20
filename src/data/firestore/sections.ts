import { db } from "@/config/firebase";
import { SchedulingSection, SchedulingSectionID } from "@/types/sessionTypes";
import { v4 as uuid } from "uuid";
import {
  doc,
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
} from "firebase/firestore";
import { Collection, SessionsSubcollection } from "./utils";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";

const sectionFirestoreConverter: FirestoreDataConverter<SchedulingSectionID, SchedulingSection> = {
  toFirestore: (section: WithFieldValue<SchedulingSectionID>): WithFieldValue<SchedulingSection> => {
    const { id, sessionId, ...dto } = section;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SchedulingSection, SchedulingSection>): SchedulingSectionID => ({ id: snapshot.ref.id, sessionId: snapshot.ref.parent.parent?.id!, ...snapshot.data() })
}

export async function getSectionById(id: string, sessionID: string, transaction?: Transaction): Promise<SchedulingSectionID> {
  return await getDoc<SchedulingSectionID, SchedulingSection>(doc(db, Collection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SchedulingSectionID, SchedulingSection>, sectionFirestoreConverter, transaction);
}

export async function setSection(  sessionID: string, section: SchedulingSection, instance?: Transaction | WriteBatch): Promise<string> {
  const sectionId = uuid();
  await setDoc<SchedulingSectionID, SchedulingSection>(doc(db, Collection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SchedulingSectionID, SchedulingSection>, { id: sectionId, sessionId: sessionID, ...section }, sectionFirestoreConverter, instance);
  return sectionId;
}

export async function updateSection(id: string, sessionID: string, updates: Partial<SchedulingSection>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SchedulingSectionID, SchedulingSection>(doc(db, Collection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SchedulingSectionID, SchedulingSection>, updates, sectionFirestoreConverter, instance);
}

export async function deleteSection(id: string, sessionID: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SchedulingSectionID, SchedulingSection>(doc(db, Collection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SchedulingSectionID, SchedulingSection>, sectionFirestoreConverter, instance);
}