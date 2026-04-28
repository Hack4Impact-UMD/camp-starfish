import { db } from "@/config/firebase";
import { ProgramArea } from "@/types/scheduling/schedulingTypes";
import { ProgramAreaDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  DocumentReference,
  collection,
  UpdateData,
  CollectionReference,
  DocumentSnapshot,
  WithFieldValue
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, executeQuery, deleteDoc } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";

function fromFirestore(snapshot: DocumentSnapshot<ProgramAreaDoc, ProgramAreaDoc> | QueryDocumentSnapshot<ProgramAreaDoc, ProgramAreaDoc>): ProgramArea {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  return {
    id: snapshot.ref.id,
    ...snapshot.data()
  }
}

export async function getProgramAreaById(id: string, transaction?: Transaction): Promise<ProgramArea> {
  const snapshot = await getDoc<ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramAreaDoc, ProgramAreaDoc>, transaction);
  return fromFirestore(snapshot);
};

export async function getProgramAreasByIds(ids: string[]): Promise<ProgramArea[]> {
  const idBatches = [];
  for (let i = 0; i < ids.length; i += 30) {
    idBatches.push(ids.slice(i, i + 30));
  }
  const responses = await Promise.all(idBatches.flatMap(idBatch => executeQuery<ProgramAreaDoc>(
    collection(db, RootLevelCollection.PROGRAM_AREAS) as CollectionReference<ProgramAreaDoc, ProgramAreaDoc>,
    { where: [{ fieldPath: '__name__', operation: 'in', value: idBatch }] }
  )));
  return responses.flatMap(response => response).map(fromFirestore);
}

export async function createProgramArea(id: string, programArea: WithFieldValue<ProgramAreaDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramAreaDoc, ProgramAreaDoc>, programArea, { instance });
}

export async function updateProgramArea(id: string, updates: UpdateData<ProgramAreaDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramAreaDoc, ProgramAreaDoc>, updates, instance);
}

export async function deleteProgramArea(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramAreaDoc, ProgramAreaDoc>, instance);
}