import { db } from "@/config/firebase";
import { Section } from "@/types/sessions/sessionTypes";
import { SectionDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
import {
  doc,
  collection,
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  UpdateData,
} from "firebase/firestore";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";

const sectionFirestoreConverter: FirestoreDataConverter<Section, SectionDoc> = {
  toFirestore: (section: WithFieldValue<Section>): WithFieldValue<SectionDoc> => {
    const { id, sessionId, ...dto } = section;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SectionDoc, SectionDoc>): Section => ({ id: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
}

export async function getSectionById(sessionId: string, sectionId: string, transaction?: Transaction): Promise<Section> {
  return await getDoc<Section, SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<Section, SectionDoc>, sectionFirestoreConverter, transaction);
}

export async function getSectionsBySessionId(sessionId: string): Promise<Section[]> {
  return await executeQuery<Section, SectionDoc>(collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS) as CollectionReference<Section, SectionDoc>, sectionFirestoreConverter);
}

export async function createSection(sessionId: string, section: SectionDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const sectionId = uuid();
  await setDoc<Section, SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<Section, SectionDoc>, { id: sectionId, sessionId, ...section }, sectionFirestoreConverter, { instance });
  return sectionId;
}

export async function updateSection(sessionId: string, sectionId: string, updates: UpdateData<SectionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Section, SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<Section, SectionDoc>, updates, sectionFirestoreConverter, instance);
}

export async function deleteSection(id: string, sessionID: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Section, SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<Section, SectionDoc>, instance);
}