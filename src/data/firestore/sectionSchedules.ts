import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { SectionScheduleDoc } from "./types/documents";
import { doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction } from "firebase/firestore";
import { getDoc } from "./firestoreClientOperations";
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
  const snapshot = await getDoc<SectionScheduleDoc>(doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleDoc, SectionScheduleDoc>, transaction);
  return fromFirestore(snapshot);
}
