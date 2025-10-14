import { db } from "@/config/firebase";
import { Album, AlbumID } from "@/types/albumTypes";
import { randomUUID } from "crypto";
import { doc, Transaction, getDoc, WriteBatch, updateDoc, deleteDoc, setDoc, FirestoreError } from "firebase/firestore";
import { Collection } from "./utils";

export async function getAlbumById(id: string, transaction?: Transaction): Promise<AlbumID> {
  const albumRef = doc(db, Collection.ALBUMS, id);
  let albumDoc;
  try {
    albumDoc = await (transaction ? transaction.get(albumRef) : getDoc(albumRef));
  } catch {
    throw new Error(`Failed to get album`);
  }
  if (!albumDoc.exists()) {
    throw new Error("Album not found");
  }
  return { id: albumDoc.id, ...albumDoc.data() } as AlbumID;
}

export async function createAlbum(album: Album, instance?: Transaction | WriteBatch): Promise<string> {
  try {
    const id = randomUUID();
    const albumRef = doc(db, Collection.ALBUMS, id);
    // @ts-expect-error - instance.set on both Transaction and WriteBatch have the same signature
    await (instance ? instance.set(id, album) : setDoc(albumRef, album));
    return id;
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "already-exists") {
      throw new Error("Album already exists");
    }
    throw new Error(`Failed to create album`);
  }
}

export async function updateAlbum(id: string, updates: Partial<Album>, instance?: Transaction | WriteBatch) {
  try {
    const albumRef = doc(db, Collection.ALBUMS, id);
    // @ts-expect-error - instance.update on both Transaction and WriteBatch have the same signature
    await (instance ? instance.update(albumRef, updates) : updateDoc(albumRef, updates));
  } catch (error: unknown) {
    if (error instanceof FirestoreError && error.code === "not-found") {
      throw new Error("Album not found");
    }
    throw new Error(`Failed to update album`);
  }
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch) {
  try {
    const albumRef = doc(db, Collection.ALBUMS, id);
    await (instance ? instance.delete(albumRef) : deleteDoc(albumRef));
  } catch {
    throw new Error(`Failed to delete album`);
  }
}
