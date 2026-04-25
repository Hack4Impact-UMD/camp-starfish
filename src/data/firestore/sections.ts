import { db } from "@/config/firebase";
import { Section } from "@/types/sessions/sessionTypes";
import { SectionDoc } from "./types/documents";
import { v4 as uuid } from "uuid";
import {
  doc,
  collection,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  UpdateData,
  DocumentSnapshot,
} from "firebase/firestore";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";

function fromFirestore(snapshot: DocumentSnapshot<SectionDoc, SectionDoc> | QueryDocumentSnapshot<SectionDoc, SectionDoc>): Section {
  if (!snapshot.exists()) { throw Error("Document not found"); };
  return {
    id: snapshot.ref.id,
    sessionId: snapshot.ref.parent.parent!.id,
    ...snapshot.data()
  }
}

export async function getSectionById(sessionId: string, sectionId: string, transaction?: Transaction): Promise<Section> {
  const snapshot = await getDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionDoc, SectionDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function getSectionsBySessionId(sessionId: string): Promise<Section[]> {
  const snapshots = await executeQuery<SectionDoc>(collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS) as CollectionReference<SectionDoc, SectionDoc>);
  return snapshots.map(fromFirestore);
}

export async function createSection(sessionId: string, section: SectionDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const sectionId = uuid();
  await setDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionDoc, SectionDoc>, section, { instance });
  return sectionId;
}

export async function updateSection(sessionId: string, sectionId: string, updates: UpdateData<SectionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionDoc, SectionDoc>, updates, instance);
}

export async function deleteSection(id: string, sessionID: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SectionDoc, SectionDoc>, instance);
}