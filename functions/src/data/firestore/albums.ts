import { Album } from "@/types/albums/albumTypes";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { v4 as uuid } from "uuid";
import { RootLevelCollection } from "@/data/firestore/types/collections";
import { createDoc, deleteDoc, getDoc, updateDoc } from "./firestoreAdminOperations";
import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot, Transaction, UpdateData, WriteBatch } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebaseAdminConfig";

function fromFirestore(snapshot: DocumentSnapshot<AlbumDoc, AlbumDoc> | QueryDocumentSnapshot<AlbumDoc, AlbumDoc>): Album {
  if (!snapshot.exists) { throw Error("Document not found"); }
  return {
    id: snapshot.ref.id,
    ...snapshot.data() as AlbumDoc
  }
}

export async function getAlbumById(id: string, transaction?: Transaction): Promise<Album> {
  const snapshot = await getDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<AlbumDoc, AlbumDoc>, transaction);
  return fromFirestore(snapshot);
}

export async function createAlbum(album: AlbumDoc, instance?: Transaction | WriteBatch): Promise<string> {
  const albumId = uuid();
  await createDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(albumId) as DocumentReference<AlbumDoc, AlbumDoc>, album, instance);
  return albumId;
}

export async function updateAlbum(id: string, updates: UpdateData<AlbumDoc>, instance?: Transaction | WriteBatch): Promise<void> {
  await updateDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<AlbumDoc, AlbumDoc>, updates, instance);
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch): Promise<void> {
  await deleteDoc<AlbumDoc>(adminDb.collection(RootLevelCollection.ALBUMS).doc(id) as DocumentReference<AlbumDoc, AlbumDoc>, instance);
}
