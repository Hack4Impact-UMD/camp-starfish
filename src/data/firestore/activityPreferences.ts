import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase/firestore";
import { ActivityPreferencesDoc } from "./types/documents";
import { ActivityPreferences } from "@/types/scheduling/schedulingTypes";
import { db } from "@/config/firebase";
import { RootLevelCollection, SectionsSubcollection, SessionsSubcollection } from "./types/collections";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc } from "./firestoreClientOperations";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";

function fromFirestore(snapshot: DocumentSnapshot<ActivityPreferencesDoc, ActivityPreferencesDoc> | QueryDocumentSnapshot<ActivityPreferencesDoc, ActivityPreferencesDoc>): ActivityPreferences {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const activityPreferencesDoc = snapshot.data();
  return {
    sessionId: snapshot.ref.parent.parent!.parent.parent!.id,
    sectionId: snapshot.ref.parent.parent!.id,
    ...activityPreferencesDoc
  }
}

function getActivityPreferencesDocRef(sessionId: string, sectionId: string) {
  return doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.ACTIVITY_PREFERENCES, SectionsSubcollection.ACTIVITY_PREFERENCES) as DocumentReference<ActivityPreferencesDoc, ActivityPreferencesDoc>;
}

function getActivityPreferencesCollectionRef(sessionId: string, sectionId: string) {
  return collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.SECTIONS, sectionId, SectionsSubcollection.ACTIVITY_PREFERENCES) as CollectionReference<ActivityPreferencesDoc, ActivityPreferencesDoc>;
}

export async function getActivityPreferencesDoc(sessionId: string, sectionId: string, transaction?: Transaction): Promise<ActivityPreferences> {
  const snapshot = await getDoc<ActivityPreferencesDoc>(getActivityPreferencesDocRef(sessionId, sectionId), transaction);
  return fromFirestore(snapshot);
}

export async function listActivityPreferencesDocs(sessionId: string, sectionId: string, queryOptions?: FirestoreQueryOptions<ActivityPreferencesDoc>): Promise<PaginatedQueryResponse<ActivityPreferences, ActivityPreferencesDoc>> {
  const snapshots = await executeQuery<ActivityPreferencesDoc>(getActivityPreferencesCollectionRef(sessionId, sectionId), queryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
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