import { db } from "@/config/firebase";
import { Person } from "@/types/people/personTypes";
import { PersonDoc } from "./types/documents";
import {
  doc,
  collection,
  CollectionReference,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  DocumentSnapshot,
  WithFieldValue,
  UpdateData,
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, deleteDoc, batchGetDocs, executeQuery } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";
import { FirestoreQueryOptions } from "./types/queries";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<PersonDoc, PersonDoc> | QueryDocumentSnapshot<PersonDoc, PersonDoc>): Person {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const personDoc = snapshot.data();
  return {
    id: Number(snapshot.ref.id),
    ...personDoc,
    dateOfBirth: moment(personDoc.dateOfBirth.toDate())
  }
}

export async function getPersonDoc(id: number, transaction?: Transaction): Promise<Person> {
  const snapshot = await getDoc<PersonDoc>(doc(db, RootLevelCollection.PEOPLE, String(id)) as DocumentReference<PersonDoc, PersonDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function batchGetPersonDocs(ids: number[]): Promise<Person[]> {
  const snapshots = await batchGetDocs<PersonDoc>(collection(db, RootLevelCollection.PEOPLE) as CollectionReference<PersonDoc, PersonDoc>, ids.map(id => String(id)));
  return snapshots.map(fromFirestore);
}

export async function listPersonDocs(firestoreQueryOptions: FirestoreQueryOptions<PersonDoc> = {}): Promise<Person[]> {
  const snapshots = await executeQuery<PersonDoc>(collection(db, RootLevelCollection.PEOPLE) as CollectionReference<PersonDoc, PersonDoc>, firestoreQueryOptions);
  return snapshots.map(fromFirestore);
}

export async function createPersonDoc(id: number, person: WithFieldValue<PersonDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<PersonDoc>(doc(db, RootLevelCollection.PEOPLE, String(id)) as DocumentReference<PersonDoc, PersonDoc>, person, { instance });
}

export async function updatePersonDoc(id: number, updates: UpdateData<PersonDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<PersonDoc>(doc(db, RootLevelCollection.PEOPLE, String(id)) as DocumentReference<PersonDoc, PersonDoc>, updates, instance);
}

export async function deletePersonDoc(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<PersonDoc>(doc(db, RootLevelCollection.PEOPLE, String(id)) as DocumentReference<PersonDoc, PersonDoc>, instance);
}