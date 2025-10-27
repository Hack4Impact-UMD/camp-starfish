import {
  Transaction,
  WriteBatch,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  DocumentReference,
} from "firebase-admin/firestore";
import { Collection } from "./utils";
import { setDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { adminDb } from "../../config/firebaseAdminConfig";
import { Credentials } from "google-auth-library";

const googleCredentialsFirestoreConverter: FirestoreDataConverter<Credentials, Credentials> = {
  toFirestore: (credentials: WithFieldValue<Credentials>): WithFieldValue<Credentials> => credentials,
  fromFirestore: (snapshot: QueryDocumentSnapshot<Credentials, Credentials>): Credentials => snapshot.data()
}

export async function getGoogleCredentialsByUid(uid: string, transaction?: Transaction): Promise<Credentials> {
  return await getDoc<Credentials, Credentials>(adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, googleCredentialsFirestoreConverter, transaction);
}

export async function setGoogleCredentials(uid: string, credentials: Credentials, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<Credentials, Credentials>(adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, credentials, googleCredentialsFirestoreConverter, instance);
}

export async function updateGoogleCredentials(uid: string, updates: Partial<Credentials>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<Credentials, Credentials>(adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, updates, googleCredentialsFirestoreConverter, instance);
}

export async function deleteGoogleCredentials(uid: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<Credentials, Credentials>(adminDb.collection(Collection.GOOGLE_OAUTH2_TOKENS).doc(uid) as DocumentReference<Credentials, Credentials>, googleCredentialsFirestoreConverter, instance);
}