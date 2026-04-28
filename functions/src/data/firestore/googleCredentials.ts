import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  DocumentSnapshot,
  WithFieldValue,
  UpdateData,
} from "firebase-admin/firestore";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { deleteDoc, getDoc, setDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";
import { Credentials } from "google-auth-library";

function fromFirestore(snapshot: DocumentSnapshot<Credentials, Credentials> | QueryDocumentSnapshot<Credentials, Credentials>): Credentials {
  if (!snapshot.exists) { throw Error("Document not found"); };
  return snapshot.data() as Credentials;
}

export async function getGoogleCredentialsByUid(uid: string, transaction?: Transaction): Promise<Credentials> {
  const snapshot = await getDoc<Credentials>(adminDb.collection(RootLevelCollection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, transaction);
  return fromFirestore(snapshot);
}

export async function setGoogleCredentials(uid: string, credentials: WithFieldValue<Credentials>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<Credentials>(adminDb.collection(RootLevelCollection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, credentials, { instance });
}

export async function updateGoogleCredentials(uid: string, updates: UpdateData<Credentials>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Credentials>(adminDb.collection(RootLevelCollection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, updates, instance);
}

export async function deleteGoogleCredentials(uid: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Credentials>(adminDb.collection(RootLevelCollection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, instance);
}