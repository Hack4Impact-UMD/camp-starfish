import { db } from "@/config/firebase";
import { Album, AlbumID } from "@/types/albumTypes";
import { v4 as uuidv4 } from "uuid";
import { doc, collection, Transaction, getDoc, WriteBatch, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Collection } from "./utils";

export async function getAlbumById(id: string, transaction?: Transaction): Promise<AlbumID> {
  const albumRef = doc(db, Collection.ALBUMS, id);
  let albumDoc;
  try {
    albumDoc = await (transaction ? transaction.get(albumRef) : getDoc(albumRef));
  } catch (error: any) {
    throw new Error(`Failed to get album: ${error.code}`);
  }
  if (!albumDoc.exists()) {
    throw new Error("Album not found");
  }
  return { id: albumDoc.id, ...albumDoc.data() } as AlbumID;
}

export async function createAlbum(album: Album, instance?: Transaction | WriteBatch): Promise<string> {
  try {
    const id = uuidv4();
    const albumRef = doc(db, Collection.ALBUMS, id);
    // @ts-ignore
    await (instance ? instance.set(id, album) : setDoc(albumRef, album));
    return id;
  } catch (error: any) {
    throw new Error(`Failed to create album: ${error.code}`);
  }
}

export async function updateAlbum(id: string, updates: Partial<Album>, instance?: Transaction | WriteBatch) {
  try {
    const albumRef = doc(db, Collection.ALBUMS, id);
    // @ts-ignore
    await (instance ? instance.update(albumRef, updates) : updateDoc(albumRef, updates));
  } catch (error: any) {
    if (error.code === "not-found") {
      throw new Error("Album not found");
    }
    throw new Error(`Failed to update album: ${error.code}`);
  }
}

export async function deleteAlbum(id: string, instance?: Transaction | WriteBatch) {
  try {
    const albumRef = doc(db, Collection.ALBUMS, id);
    await (instance ? instance.delete(albumRef) : deleteDoc(albumRef));
  } catch (error: any) {
    throw new Error(`Failed to delete album: ${error.code}`);
  }
}
