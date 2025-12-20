import { SchedulingSectionType, SectionSchedule, SectionScheduleID } from "@/types/sessionTypes";
import { doc, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Transaction, WithFieldValue } from "firebase/firestore";
import { getDoc } from "./firestoreClientOperations";
import { db } from "@/config/firebase";
import { Collection, SectionsSubcollection, SessionsSubcollection } from "./utils";

const sectionScheduleFirestoreConverter: FirestoreDataConverter<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>> = {
  toFirestore: (schedule: WithFieldValue<SectionScheduleID<SchedulingSectionType>>): WithFieldValue<SectionSchedule<SchedulingSectionType>> => {
    const { id, sectionId, sessionId, ...dto } = schedule;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SectionSchedule<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>): SectionScheduleID<SchedulingSectionType> => ({ id: snapshot.ref.id, sectionId: snapshot.ref.parent.parent!.id, sessionId: snapshot.ref.parent.parent!.parent.parent!.id, ...snapshot.data() })
}

export async function getSectionSchedule(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionScheduleID<SchedulingSectionType>> {
  return await getDoc<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>(doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>, sectionScheduleFirestoreConverter, transaction);
}
