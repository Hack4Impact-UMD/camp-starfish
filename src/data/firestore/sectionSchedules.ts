import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { SectionScheduleDoc } from "./types/documents";
import { doc, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, WithFieldValue } from "firebase/firestore";
import { getDoc } from "./firestoreClientOperations";
import { db } from "@/config/firebase";
import { Collection, SectionsSubcollection, SessionsSubcollection } from "./types/collections";

const sectionScheduleFirestoreConverter: FirestoreDataConverter<SectionSchedule, SectionScheduleDoc> = {
  toFirestore: (schedule: WithFieldValue<SectionSchedule>): WithFieldValue<SectionScheduleDoc> => {
    const { sectionId, sessionId, ...dto } = schedule;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc>): SectionSchedule => ({ sectionId: snapshot.ref.parent.parent!.id, sessionId: snapshot.ref.parent.parent!.parent.parent!.id, ...snapshot.data() })
}

export async function getSectionSchedule(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionSchedule> {
  return await getDoc<SectionSchedule, SectionScheduleDoc>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionSchedule, SectionScheduleDoc>, sectionScheduleFirestoreConverter, transaction);
} 
