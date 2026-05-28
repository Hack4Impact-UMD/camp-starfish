import { collection, CollectionReference, doc, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WithFieldValue, WriteBatch } from "firebase/firestore";
import { BunkDoc } from "./types/documents";
import { Bunk } from "@/types/sessions/sessionTypes";
import { db } from "@/config/firebase";
import { RootLevelCollection, SessionsSubcollection } from "./types/collections";
import { FirestoreQueryOptions, PaginatedQueryResponse } from "./types/queries";
import { deleteDoc, executeQuery, getDoc, mapSnapshotsToPaginatedQueryResult, setDoc, updateDoc } from "./firestoreClientOperations";


function fromFirestore(snapshot: DocumentSnapshot<BunkDoc, BunkDoc> | QueryDocumentSnapshot<BunkDoc, BunkDoc>): Bunk {
  if (!snapshot.exists()) { throw Error("Document not found"); }
  const bunkDoc = snapshot.data();
  return {
    bunkNum: Number(snapshot.ref.id),
    sessionId: snapshot.ref.parent.parent!.id,
    ...bunkDoc
  }
}

function getBunkDocRef(sessionId: string, bunkNum: number) {
  return doc(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.BUNKS, `${bunkNum}`) as DocumentReference<BunkDoc, BunkDoc>;
}

function getBunkCollectionRef(sessionId: string) {
  return collection(db, RootLevelCollection.SESSIONS, sessionId, SessionsSubcollection.BUNKS) as CollectionReference<BunkDoc, BunkDoc>;
}

export async function getBunkDoc(sessionId: string, bunkNum: number, transaction?: Transaction): Promise<Bunk> {
  const snapshot = await getDoc<BunkDoc>(getBunkDocRef(sessionId, bunkNum), transaction);
  return fromFirestore(snapshot);
}

export async function listBunkDocs(sessionId: string, queryOptions?: FirestoreQueryOptions<BunkDoc>): Promise<PaginatedQueryResponse<Bunk, BunkDoc>> {
  const snapshots = await executeQuery<BunkDoc>(getBunkCollectionRef(sessionId), queryOptions);
  return mapSnapshotsToPaginatedQueryResult(snapshots, fromFirestore);
}

export async function createBunkDoc(sessionId: string, bunkNum: number, bunk: WithFieldValue<BunkDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await setDoc(getBunkDocRef(sessionId, bunkNum), bunk, { instance });
}

export async function updateBunkDoc(sessionId: string, bunkNum: number, updates: UpdateData<BunkDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<BunkDoc>(getBunkDocRef(sessionId, bunkNum), updates, instance);
}

export async function deleteBunkDoc(sessionId: string, bunkNum: number, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<BunkDoc>(getBunkDocRef(sessionId, bunkNum), instance);
}