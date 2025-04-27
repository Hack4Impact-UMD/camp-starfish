import { db } from "@/config/firebase";
import { Album } from "@/types/albumTypes";
import { doc, collection, Firestore, Transaction } from "firebase/firestore";

const ALBUMS_COLLECTION = "albums"

export async function getAlbumById(
  transaction: Transaction,
  id: string
) {
  try {
    const ref = doc(db, ALBUMS_COLLECTION, id);
    const snap = await transaction.get(ref);
    if (!snap.exists()) throw new Error(`No album found with id "${id}"`);
    return { id: snap.id, ...snap.data() };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    if (e instanceof Error && e.message.includes('No album found with id')) {
      throw e;
    }
    throw new Error(`getAlbumById failed: ${errorMessage}`);
  }
}

export async function createAlbum(
  transaction: Transaction,
  album: { title: string }
) {
  try {
    const ref = doc(collection(db, ALBUMS_COLLECTION));
    transaction.set(ref, { ...album, id: ref.id });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`createAlbum failed: ${errorMessage}`);
  }
}

export async function updateAlbum(
  transaction: Transaction,
  id: string,
  updates: Partial<{ title: string }>
) {
  try {
    const ref = doc(db, ALBUMS_COLLECTION, id);
    transaction.update(ref, updates);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`updateAlbum failed: ${errorMessage}`);
  }
}

export async function deleteAlbum(
  transaction: Transaction,
  id: string
) {
  try {
    const ref = doc(db, ALBUMS_COLLECTION, id);
    transaction.delete(ref);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`deleteAlbum failed: ${errorMessage}`);
  }
}
