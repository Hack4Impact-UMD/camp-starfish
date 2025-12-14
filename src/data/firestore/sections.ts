import { db } from "@/config/firebase";
import { Section, SectionID } from "@/types/sessionTypes";
import { v4 as uuid } from "uuid";
import {
  doc,
  collection,
  query,
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
} from "firebase/firestore";
import { Collection, SessionsSubcollection } from "./utils";
import { setDoc, deleteDoc, getDoc, updateDoc, executeQuery } from "./firestoreClientOperations";

const sectionFirestoreConverter: FirestoreDataConverter<SectionID, Section> = {
  toFirestore: (section: WithFieldValue<SectionID>): WithFieldValue<Section> => {
    const { id, sessionId, ...dto } = section;
    return dto;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<Section, Section>): SectionID => ({ 
    id: snapshot.ref.id, 
    sessionId: snapshot.ref.parent.parent!.id, 
    ...snapshot.data() 
  })
};

export async function getSectionById(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionID> {
  return await getDoc<SectionID, Section>(
    doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, 
    sectionFirestoreConverter, 
    transaction
  );
}

export async function getSectionsBySession(sessionId: string): Promise<SectionID[]> {
  const sectionsRef = collection(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS) as CollectionReference<SectionID, Section>;
  const q = query(sectionsRef);
  return await executeQuery<SectionID, Section>(q, sectionFirestoreConverter);
}

export async function setSection(sessionId: string, section: Section, instance?: Transaction | WriteBatch): Promise<string> {
  const sectionId = uuid();
  console.log('Creating section with data:', {
    sessionId,
    sectionId,
    section,
    fullData: { id: sectionId, sessionId, ...section }
  });
  
  await setDoc<SectionID, Section>(
    doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, 
    { id: sectionId, sessionId, ...section } as SectionID, 
    sectionFirestoreConverter, 
    instance
  );
  return sectionId;
}

export async function updateSection(sessionId: string, sectionId: string, updates: Partial<Section>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionID, Section>(
    doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, 
    updates, 
    sectionFirestoreConverter, 
    instance
  );
}

export async function deleteSection(sessionId: string, sectionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionID, Section>(
    doc(db, Collection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId) as DocumentReference<SectionID, Section>, 
    sectionFirestoreConverter, 
    instance
  );
}
