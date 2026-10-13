import { SectionScheduleDoc } from "@/data/firestore/types/documents";
import { SectionSchedule } from "@/types/scheduling/schedulingTypes";
import { adminDb } from "../../config/firebaseAdminConfig";
import { RootLevelCollection, SectionsSubcollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc, FirestoreQueryOptions, PaginatedQueryResponse } from "./firestoreAdminOperations";
import { CollectionReference, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";

export function fromFirestore(snapshot: DocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc> | QueryDocumentSnapshot<SectionScheduleDoc, SectionScheduleDoc>): SectionSchedule {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const doc = snapshot.data() as SectionScheduleDoc;
  return {
    sectionId: snapshot.ref.parent.parent!.id,
    sessionId: snapshot.ref.parent.parent!.parent.parent!.id,
    ...doc,
    blocks: Object.keys(doc.blocks).reduce((newBlocks, blockId) => {
      const block = doc.blocks[blockId];
      return {
        ...newBlocks,
        [blockId]: {
          ...block,
          activities: Object.keys(block.activities).reduce((newActivities, activityId) => {
            const activity = block.activities[activityId];
            return {
              ...newActivities,
              [activityId]: {
                ...activity,
                id: activityId
              }
            }
          }, {})
        }
      }
    }, {})
  }
}

function getSectionScheduleDocRef(sessionId: string, sectionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.SECTIONS).doc(sectionId).collection(SectionsSubcollection.SCHEDULE).doc(SectionsSubcollection.SCHEDULE) as DocumentReference<SectionScheduleDoc, SectionScheduleDoc>;
}

function getSectionScheduleCollectionRef(sessionId: string, sectionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.SECTIONS).doc(sectionId).collection(SectionsSubcollection.SCHEDULE) as CollectionReference<SectionScheduleDoc, SectionScheduleDoc>;
}

export async function getSectionScheduleDoc(sessionId: string, sectionId: string, transaction?: Transaction): Promise<SectionSchedule> {
  const snapshot = await getDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), transaction);
  return fromFirestore(snapshot);
}

export async function listSectionScheduleDocs(sessionId: string, sectionId: string, queryOptions: FirestoreQueryOptions<SectionScheduleDoc> = {}, transaction?: Transaction): Promise<PaginatedQueryResponse<SectionSchedule, SectionScheduleDoc>> {
  const snapshots = await executeQuery<SectionScheduleDoc>(getSectionScheduleCollectionRef(sessionId, sectionId), { queryOptions, transaction });
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function setSectionScheduleDoc(sessionId: string, sectionId: string, sectionSchedule: WithFieldValue<SectionScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc(getSectionScheduleDocRef(sessionId, sectionId), sectionSchedule, { instance });
}

export async function updateSectionScheduleDoc(sessionId: string, sectionId: string, updates: UpdateData<SectionScheduleDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), updates, instance);
}

export async function deleteSectionScheduleDoc(sessionId: string, sectionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<SectionScheduleDoc>(getSectionScheduleDocRef(sessionId, sectionId), instance);
}