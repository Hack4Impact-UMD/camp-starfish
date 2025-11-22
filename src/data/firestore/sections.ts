import { db } from "@/config/firebase";
import { SchedulingSection, SchedulingSectionID, SectionSchedule, SectionScheduleID, SchedulingSectionType, Freeplay, FreeplayID, AttendeeID, CamperAttendee, StaffAttendee, AdminAttendee } from "@/types/sessionTypes";
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
import { Collection, SessionsSubcollection, SectionsSubcollection } from "./utils";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreClientOperations";

const sectionFirestoreConverter: FirestoreDataConverter<SchedulingSectionID, SchedulingSection> = {
  toFirestore: (section: WithFieldValue<SchedulingSectionID>): WithFieldValue<SchedulingSection> => {
    const { id, sessionId, ...dto } = section;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SchedulingSection, SchedulingSection>): SchedulingSectionID => ({ id: snapshot.ref.id, sessionId: snapshot.ref.parent.parent!.id, ...snapshot.data() })
}

export async function getSectionById(id: string, sessionID: string, transaction?: Transaction): Promise<SchedulingSectionID> {
  return await getDoc<SchedulingSectionID, SchedulingSection>(doc(db, Collection.SESSIONS, sessionID, SessionsSubcollection.SECTIONS, id) as DocumentReference<SchedulingSectionID, SchedulingSection>, sectionFirestoreConverter, transaction);
}

export async function setSection(sessionID: string, section: SchedulingSection, instance?: Transaction | WriteBatch): Promise<string> {
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

const scheduleFirestoreConverter: FirestoreDataConverter<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>> = {
  toFirestore: (schedule: WithFieldValue<SectionScheduleID<SchedulingSectionType>>): WithFieldValue<SectionSchedule<SchedulingSectionType>> => {
    const { id, sessionId, sectionId, ...dto } = schedule as SectionScheduleID<SchedulingSectionType>;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<SectionSchedule<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>): SectionScheduleID<SchedulingSectionType> => {
    const data = snapshot.data();
    return {
      id: snapshot.ref.id,
      sessionId: snapshot.ref.parent.parent!.parent!.id,
      sectionId: snapshot.ref.parent.parent!.id,
      ...data,
    } as SectionScheduleID<SchedulingSectionType>;
  },
};

export async function getSectionScheduleBySectionId(sectionId: string, sessionId: string, transaction?: Transaction): Promise<SectionScheduleID<SchedulingSectionType> | null> {
  try {
    return await getDoc<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>(
      doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.SCHEDULE, SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleID<SchedulingSectionType>, SectionSchedule<SchedulingSectionType>>,
      scheduleFirestoreConverter,
      transaction
    );
  } catch {
    return null;
  }
}

export const freeplayConverter: FirestoreDataConverter<FreeplayID, Freeplay> = {
  toFirestore: (freeplay: WithFieldValue<FreeplayID>) => {
    const { id, sessionId, ...dto } = freeplay as FreeplayID;
    return dto as WithFieldValue<Freeplay>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Freeplay, Freeplay>): FreeplayID => {
    const data = snapshot.data();
    return {
      id: snapshot.ref.id,
      sessionId: snapshot.ref.parent.parent!.id,
      ...data,
    } as FreeplayID;
  },
};

export const attendeeConverter: FirestoreDataConverter<
  AttendeeID,
  CamperAttendee | StaffAttendee | AdminAttendee
> = {
  toFirestore: (attendee: WithFieldValue<AttendeeID>) => {
    const { id, sessionId, ...dto } = attendee as AttendeeID;
    return dto as WithFieldValue<CamperAttendee | StaffAttendee | AdminAttendee>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<CamperAttendee | StaffAttendee | AdminAttendee, CamperAttendee | StaffAttendee | AdminAttendee>): AttendeeID => {
    const data = snapshot.data();
    return {
      id: Number(snapshot.ref.id),
      sessionId: snapshot.ref.parent.parent!.id,
      ...data,
    } as AttendeeID;
  },
};