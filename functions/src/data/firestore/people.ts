import { Person } from "@/types/people/personTypes";
import { PersonDoc } from "@/data/firestore/types/documents";
import {
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  UpdateData,
  WithFieldValue,
} from "firebase-admin/firestore";
import { createDoc, getDoc, updateDoc, deleteDoc, executeQuery, batchGetDocs } from "./firestoreAdminOperations";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { adminDb } from "../../config/firebaseAdminConfig";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<PersonDoc, PersonDoc> | QueryDocumentSnapshot<PersonDoc, PersonDoc>): Person {
  if (!snapshot.exists) { throw Error("Document not found"); };
  const personDoc = snapshot.data() as PersonDoc;
  return {
    id: Number(snapshot.ref.id),
    ...personDoc,
    dateOfBirth: moment(personDoc.dateOfBirth.toDate())
  }
}

export async function getPersonDocById(id: number, transaction?: Transaction): Promise<Person> {
  const snapshot = await getDoc<PersonDoc>(adminDb.collection(RootLevelCollection.PEOPLE).doc(String(id)) as DocumentReference<PersonDoc, PersonDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function batchGetPersonDocs(ids: number[], transaction?: Transaction): Promise<Person[]> {
  const snapshots = await batchGetDocs<PersonDoc>(adminDb.collection(RootLevelCollection.PEOPLE) as CollectionReference<PersonDoc, PersonDoc>, ids.map(id => String(id)), transaction);
  return snapshots.map(fromFirestore);
}

export async function getPersonDocByEmail(email: string, transaction?: Transaction): Promise<Person> {
  const snapshots = await executeQuery<PersonDoc>(adminDb.collection(RootLevelCollection.PEOPLE) as CollectionReference<PersonDoc, PersonDoc>, {
    transaction,
    queryOptions: {
      where: [{ fieldPath: 'email', operation: '==', value: email }],
      limit: 1,
    },
  })
  if (snapshots.length === 0) {
    throw new Error("No person with email found");
  }
  return fromFirestore(snapshots[0]);
}

export async function createPersonDoc(id: number, person: WithFieldValue<PersonDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await createDoc<PersonDoc>(adminDb.collection(RootLevelCollection.PEOPLE).doc(String(id)) as DocumentReference<PersonDoc, PersonDoc>, person, instance);
}

export async function updatePersonDoc(id: number, updates: UpdateData<PersonDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<PersonDoc>(adminDb.collection(RootLevelCollection.PEOPLE).doc(String(id)) as DocumentReference<PersonDoc, PersonDoc>, updates, instance);
}

export async function deletePersonDoc(id: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<PersonDoc>(adminDb.collection(RootLevelCollection.PEOPLE).doc(String(id)) as DocumentReference<PersonDoc, PersonDoc>, instance);
}