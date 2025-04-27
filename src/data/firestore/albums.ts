import { db } from "@/config/firebase";
import { Album } from "@/types/albumTypes";
import { randomUUID } from "crypto";
import { doc, collection, Transaction, getDoc, WriteBatch, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Collection } from "./utils";

export async function getAlbumById(id: string, transaction?: Transaction) {
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
  return albumDoc.data() as Album;
}

export async function createAlbum(album: Album, instance?: Transaction | WriteBatch) {
  try {
    const albumsCollection = collection(db, Collection.ALBUMS);
    // @ts-ignore
    const albumRef = await (instance ? instance.set(randomUUID(), album) : addDoc(albumsCollection, album));
  } catch (error: any) {
    throw new Error(`Failed to create camper: ${error.code}`);
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
