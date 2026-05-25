import { db } from "@/config/firebase";
import { CommonSection, SchedulingSection, Section } from "@/types/sessions/sessionTypes";
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
  WithFieldValue,
} from "firebase/firestore";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";
import moment from "moment";
import { FirestoreQueryOptions } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<SectionDoc, SectionDoc> | QueryDocumentSnapshot<SectionDoc, SectionDoc>): Section {
  if (!snapshot.exists()) { throw Error("Document not found"); };
  const sectionDoc = snapshot.data();
  switch (sectionDoc.type) {
    case "COMMON":
      return {
        id: snapshot.ref.id,
        sessionId: snapshot.ref.parent.parent!.id,
        name: sectionDoc.name,
        startDate: moment(sectionDoc.startDate.toDate()),
        endDate: moment(sectionDoc.endDate.toDate()),
        type: sectionDoc.type
      } satisfies CommonSection;
    case "BUNDLE":
    case "BUNK-JAMBO":
    case "NON-BUNK-JAMBO":
      return {
        id: snapshot.ref.id,
        sessionId: snapshot.ref.parent.parent!.id,
        name: sectionDoc.name,
        startDate: moment(sectionDoc.startDate.toDate()),
        endDate: moment(sectionDoc.endDate.toDate()),
        type: sectionDoc.type,
        publishedAt: sectionDoc.publishedAt ? moment(sectionDoc.publishedAt.toDate()) : undefined
      } satisfies SchedulingSection;
    default: throw Error("Unknown section type");
  }
}

export async function getSectionDoc(sessionId: string, sectionId: string, transaction?: Transaction): Promise<Section> {
  const snapshot = await getDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionDoc, SectionDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function listSectionDocs(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<SectionDoc> = {}): Promise<Section[]> {
  const snapshots = await executeQuery<SectionDoc>(collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS) as CollectionReference<SectionDoc, SectionDoc>, firestoreQueryOptions);
  return snapshots.map(fromFirestore);
}

export async function createSectionDoc(sessionId: string, section: WithFieldValue<SectionDoc>, instance?: Transaction | WriteBatch): Promise<string> {
  const sectionId = uuid();
  await setDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionDoc, SectionDoc>, section, { instance });
  return sectionId;
}

export async function updateSectionDoc(sessionId: string, sectionId: string, updates: UpdateData<SectionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionDoc, SectionDoc>, updates, instance);
}

export async function deleteSectionDoc(id: string, sessionID: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionDoc>(doc(db, RootLevelCollection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SectionDoc, SectionDoc>, instance);
}