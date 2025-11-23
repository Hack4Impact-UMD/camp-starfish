import { db } from "@/config/firebase";
import { SchedulingSection, SchedulingSectionID, Section, SectionID } from "@/types/sessionTypes";
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

const sectionFirestoreConverter: FirestoreDataConverter<SectionID, Section> = {
  toFirestore: (section: WithFieldValue<SectionID>): WithFieldValue<Section> => {
    const { id, sessionId, ...dto } = section;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Section, Section>): SectionID => ({ id: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
}

export async function getSectionById(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionID> {
  return await getDoc<SectionID, Section>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, sectionFirestoreConverter, transaction);
}

export async function setSection(sessionId: string, section: Section, instance?: Transaction | WriteBatch): Promise<string> {
  const sectionId = uuid();
  await setDoc<SectionID, Section>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, { id: sectionId, sessionId, ...section }, sectionFirestoreConverter, instance);
  return sectionId;
}

export async function updateSection(sessionId: string, sectionId: string, updates: Partial<Section>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionID, Section>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, updates, sectionFirestoreConverter, instance);
}

export async function deleteSection(id: string, sessionID: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionID, Section>(doc(db, Collection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SectionID, Section>, sectionFirestoreConverter, instance);
}
