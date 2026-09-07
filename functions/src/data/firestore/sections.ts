import { SectionDoc } from "@/data/firestore/types/documents";
import { CommonSection, SchedulingSection, Section } from "@/types/sessions/sessionTypes";
import { adminDb } from "../../config/firebaseAdminConfig";
import { RootLevelCollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc, FirestoreQueryOptions, PaginatedQueryResponse } from "./firestoreAdminOperations";
import { CollectionReference, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<SectionDoc, SectionDoc> | QueryDocumentSnapshot<SectionDoc, SectionDoc>): Section {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const sectionDoc = snapshot.data() as SectionDoc;
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
        publishedAt: sectionDoc.publishedAt ? moment(sectionDoc.publishedAt.toDate()) : undefined,
      } satisfies SchedulingSection;
    default: throw Error("Unknown section type");
  }
}

function getSectionDocRef(sessionId: string, sectionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.SECTIONS).doc(sectionId) as DocumentReference<SectionDoc, SectionDoc>;
}

function getSectionCollectionRef(sessionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.SECTIONS) as CollectionReference<SectionDoc, SectionDoc>;
}

export async function getSectionDoc(sessionId: string, sectionId: string, transaction?: Transaction): Promise<Section> {
  const snapshot = await getDoc<SectionDoc>(getSectionDocRef(sessionId, sectionId), transaction);
  return fromFirestore(snapshot);
}

export async function listSectionDocs(sessionId: string, queryOptions: FirestoreQueryOptions<SectionDoc> = {}, transaction?: Transaction): Promise<PaginatedQueryResponse<Section, SectionDoc>> {
  const snapshots = await executeQuery<SectionDoc>(getSectionCollectionRef(sessionId), { queryOptions, transaction });
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function setSectionDoc(sessionId: string, sectionId: string, activityPreferences: WithFieldValue<SectionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc(getSectionDocRef(sessionId, sectionId), activityPreferences, { instance });
}

export async function updateSectionDoc(sessionId: string, sectionId: string, updates: UpdateData<SectionDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionDoc>(getSectionDocRef(sessionId, sectionId), updates, instance);
}

export async function deleteSectionDoc(sessionId: string, sectionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionDoc>(getSectionDocRef(sessionId, sectionId), instance);
}