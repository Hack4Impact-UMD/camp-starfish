import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { v4 as uuid } from "uuid";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { createDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";
import moment from "moment";

function fromFirestore(snapshot: DocumentSnapshot<AlbumDoc, AlbumDoc> | QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album {
  if (!snapshot.exists) { throw Error("Document not found"); }
  const albumDoc = snapshot.data() as AlbumDoc;
  return {
    id: snapshot.ref.id,
    name: albumDoc.name,
    numItems: albumDoc.numItems,
    thumbnailSrc: albumDoc.thumbnailSrc,
    startDate: albumDoc.startDate ? moment(albumDoc.startDate.toMillis()) : undefined,
    endDate: albumDoc.endDate ? moment(albumDoc.endDate.toMillis()) : undefined,
    linkedSessionId: albumDoc.linkedSessionId,
  }
}

export async function getAlbumDoc(id: string, transaction?: Transaction): Promise<Album> {
  const snapshot = await getDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<AlbumDoc, AlbumDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function createAlbumDoc(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await createDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId) as DocumentReference<AlbumDoc, AlbumDoc>, album, instance);
  return albumId;
}

export async function updateAlbumDoc(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<AlbumDoc, AlbumDoc>, updates, instance);
}

export async function deleteAlbumDoc(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<AlbumDoc, AlbumDoc>, instance);
}
