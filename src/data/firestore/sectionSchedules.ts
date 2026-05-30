import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { SectionScheduleDoc } from "./types/documents";
import { doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, PartialWithFieldValue } from "firebase/firestore";
import { getDoc, setDoc, updateDoc } from "./firestoreClientOperations";
import { db } from "@/config/firebase";
import { RootLevelCollection, SectionsSubcollection, SessionsSubcollection } from "./types/collections";

function fromFirestore(snapshot: DocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc> | QueryDocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc>): SectionSchedule {
  if (!snapshot.exists()) { throw Error("Document not found"); };
  return {
    sectionId: snapshot.ref.parent.parent!.id,
    sessionId: snapshot.ref.parent.parent!.parent.parent!.id,
    ...snapshot.data()
  }
}

export async function getSectionSchedule(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionSchedule> {
  if (!sectionId || sectionId === SectionsSubcollection.SCHEDULE) {
    throw new Error(`Invalid sectionId provided: ${sectionId}`);
  }
  const snapshot = await getDoc<SectionScheduleDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleDoc, SectionScheduleDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function updateSectionSchedule(sessionId: string, sectionId: string, updates: PartialWithFieldValue<SectionScheduleDoc>): Promise<void> {
  if (!sectionId || sectionId === SectionsSubcollection.SCHEDULE) {
    throw new Error(`Invalid sectionId provided: ${sectionId}`);
  }
  const ref = doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleDoc, SectionScheduleDoc>;
  await setDoc<SectionScheduleDoc>(ref, updates, { mergeOptions: { merge: true } });
}
