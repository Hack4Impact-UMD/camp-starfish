import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { SectionDoc, SectionScheduleDoc } from "./types/documents";
import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase/firestore";
import { deleteDoc, executeQuery, getDoc, setDoc, updateDoc } from "./firestoreClientOperations";
import { db } from "@/config/firebase";
import { RootLevelCollection, SectionsSubcollection, SessionsSubcollection } from "./types/collections";
import { FirestoreQueryOptions } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc> | QueryDocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc>): SectionSchedule {
  if (!snapshot.exists()) { throw Error("Document not found"); };
  return {
    sectionId: snapshot.ref.parent.parent!.id,
    sessionId: snapshot.ref.parent.parent!.parent.parent!.id,
    ...snapshot.data()
  }
}

function getSectionScheduleDocRef(sessionId: string, sectionId: string): DocumentReference<SectionScheduleDoc, SectionScheduleDoc> {
  return doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleDoc, SectionScheduleDoc>;
}

function getSectionScheduleCollectionRef(sessionId: string, sectionId: string): CollectionReference<SectionScheduleDoc, SectionScheduleDoc> {
  return collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE) as CollectionReference<SectionScheduleDoc, SectionScheduleDoc>;
}

export async function getSectionScheduleDoc(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionSchedule> {
  const snapshot = await getDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), transaction);
  return fromFirestore(snapshot);
}

export async function listSectionScheduleDocs(sessionId: string, sectionId: string, firestoreQueryOptions: FirestoreQueryOptions<SectionScheduleDoc> = {}): Promise<SectionSchedule[]> {
  const snapshots = await executeQuery<SectionScheduleDoc>(getSectionScheduleCollectionRef(sessionId, sectionId), firestoreQueryOptions);
  return snapshots.map(fromFirestore);
}

export async function setSectionScheduleDoc(sessionId: string, sectionId: string, sectionSchedule: WithFieldValue<SectionScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), sectionSchedule, { instance });
}

export async function updateSectionScheduleDoc(sessionId: string, sectionId: string, updates: UpdateData<SectionScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), updates, instance);
}

export async function deleteSectionScheduleDoc(sessionId: string, sectionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), instance);
}