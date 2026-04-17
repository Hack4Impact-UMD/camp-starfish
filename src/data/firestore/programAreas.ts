import { db } from "@/config/firebase";
import { ProgramArea } from "@/types/scheduling/schedulingTypes";
import { ProgramAreaDoc } from "./types/documents";
import {
  doc,
  Transaction,
  WriteBatch,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  WithFieldValue,
  DocumentReference,
  collection,
  where,
  query,
  Query,
  UpdateData,
  documentId,
  CollectionReference
} from "firebase/firestore";
import { setDoc, getDoc, updateDoc, executeQuery, deleteDoc } from "./firestoreClientOperations";
import { RootLevelCollection } from "./types/collections";

const programAreaFirestoreConverter: FirestoreDataConverter<ProgramArea, ProgramAreaDoc> = {
  toFirestore: (programArea: WithFieldValue<ProgramArea>) => {
    const { id, ...dto } = programArea;
    return dto as WithFieldValue<ProgramArea>;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<ProgramAreaDoc, ProgramAreaDoc>): ProgramArea => ({ id: snapshot.ref.id, ...snapshot.data() })
};

export async function getProgramAreaById(id: string, transaction?: Transaction): Promise<ProgramArea> {
  return await getDoc<ProgramArea, ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramArea, ProgramAreaDoc>, programAreaFirestoreConverter, transaction);
};

export async function getProgramAreasByIds(ids: string[]): Promise<ProgramArea[]> {
  const idBatches = [];
  for (let i = 0; i < ids.length; i += 30) {
    idBatches.push(ids.slice(i, i + 30));
  }
  const responses = await Promise.all(idBatches.flatMap(idBatch => executeQuery<ProgramArea, ProgramAreaDoc>(
    collection(db, RootLevelCollection.PROGRAM_AREAS) as CollectionReference<ProgramArea, ProgramAreaDoc>,
    programAreaFirestoreConverter,
    { where: [{ fieldPath: '__name__', operation: 'in', value: idBatch }] }
  )));
  return responses.flatMap(response => response)
}

export async function createProgramArea(id: string, programArea: ProgramAreaDoc, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc<ProgramArea, ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramArea, ProgramAreaDoc>, { id, ...programArea }, programAreaFirestoreConverter, { instance });
}

export async function updateProgramArea(id: string, updates: UpdateData<ProgramAreaDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<ProgramArea, ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramArea, ProgramAreaDoc>, updates, programAreaFirestoreConverter, instance);
}

export async function deleteProgramArea(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<ProgramArea, ProgramAreaDoc>(doc(db, RootLevelCollection.PROGRAM_AREAS, id) as DocumentReference<ProgramArea, ProgramAreaDoc>, programAreaFirestoreConverter, instance);
}