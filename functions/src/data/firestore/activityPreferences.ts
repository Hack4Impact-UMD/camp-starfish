
import { ActivityPreferencesDoc } from "@/data/firestore/types/documents";
import { ActivityPreferences } from "@/types/scheduling/schedulingTypes";
import { adminDb } from "../../config/firebaseAdminConfig";
import { RootLevelCollection, SectionsSubcollection, SessionsSubcollection } from "@/data/firestore/types/collections";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc, FirestoreQueryOptions, PaginatedQueryResponse } from "./firestoreAdminOperations";
import { CollectionReference, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase-admin/firestore";

export function mapActivityPreferencesFromFirestore(snapshot: DocumentSnapshot<ActivityPreferencesDoc, ActivityPreferencesDoc> | QueryDocumentSnapshot<ActivityPreferencesDoc, ActivityPreferencesDoc>): ActivityPreferences {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const activityPreferencesDoc = snapshot.data() as ActivityPreferencesDoc;
  return {
    sessionId: snapshot.ref.parent.parent!.parent.parent!.id,
    sectionId: snapshot.ref.parent.parent!.id,
    ...activityPreferencesDoc
  }
}

function getActivityPreferencesDocRef(sessionId: string, sectionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.SECTIONS).doc(sectionId).collection(SectionsSubcollection.ACTIVITY_PREFERENCES).doc(SectionsSubcollection.ACTIVITY_PREFERENCES) as DocumentReference<ActivityPreferencesDoc, ActivityPreferencesDoc>;
}

function getActivityPreferencesCollectionRef(sessionId: string, sectionId: string) {
  return adminDb.collection(RootLevelCollection.SESSIONS).doc(sessionId).collection(SessionsSubcollection.SECTIONS).doc(sectionId).collection(SectionsSubcollection.ACTIVITY_PREFERENCES) as CollectionReference<ActivityPreferencesDoc, ActivityPreferencesDoc>;
}

export async function getActivityPreferencesDoc(sessionId: string, sectionId: string, transaction?: Transaction): Promise<ActivityPreferences> {
  const snapshot = await getDoc<ActivityPreferencesDoc>(getActivityPreferencesDocRef(sessionId, sectionId), transaction);
  return mapActivityPreferencesFromFirestore(snapshot);
}

export async function listActivityPreferencesDocs(sessionId: string, sectionId: string, queryOptions: FirestoreQueryOptions<ActivityPreferencesDoc> = {}, transaction?: Transaction): Promise<PaginatedQueryResponse<ActivityPreferences, ActivityPreferencesDoc>> {
  const snapshots = await executeQuery<ActivityPreferencesDoc>(getActivityPreferencesCollectionRef(sessionId, sectionId), { queryOptions, transaction });
  return mapSnapshotsToPaginatedQueryResult(snapshots, mapActivityPreferencesFromFirestore);
}

export async function setActivityPreferencesDoc(sessionId: string, sectionId: string, activityPreferences: WithFieldValue<ActivityPreferencesDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc(getActivityPreferencesDocRef(sessionId, sectionId), activityPreferences, { instance });
}

export async function updateActivityPreferencesDoc(sessionId: string, sectionId: string, updates: UpdateData<ActivityPreferencesDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<ActivityPreferencesDoc>(getActivityPreferencesDocRef(sessionId, sectionId), updates, instance);
}

export async function deleteActivityPreferencesDoc(sessionId: string, sectionId: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<ActivityPreferencesDoc>(getActivityPreferencesDocRef(sessionId, sectionId), instance);
}