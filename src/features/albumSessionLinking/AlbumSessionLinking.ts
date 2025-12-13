import { getSessionById, updateSession } from "@/data/firestore/sessions";
import { getAlbumById, updateAlbum } from "@/data/firestore/albums";
import { Transaction, runTransaction } from "firebase/firestore";
import { db } from "@/config/firebase";

export class AlbumSessionLinkingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlbumSessionLinkingError";
  }
}

/**
 * Links a session and album together in a 1:1 relationship
 * @param sessionId - The ID of the session to link
 * @param albumId - The ID of the album to link
 * @throws AlbumSessionLinkingError if either is already linked to another entity
 */
export async function linkSessionAndAlbum(sessionId: string, albumId: string): Promise<void> {
  await runTransaction(db, async (transaction: Transaction) => {
    // Get current session and album data
    const session = await getSessionById(sessionId, transaction);
    const album = await getAlbumById(albumId, transaction);

    // Check if session is already linked to another album
    if (session.albumId && session.albumId !== albumId) {
      throw new AlbumSessionLinkingError(
        `Session ${sessionId} is already linked to album ${session.albumId}`
      );
    }

    // Check if album is already linked to another session
    if (album.sessionId && album.sessionId !== sessionId) {
      throw new AlbumSessionLinkingError(
        `Album ${albumId} is already linked to session ${album.sessionId}`
      );
    }

    // If they're already linked to each other, no action needed
    if (session.albumId === albumId && album.sessionId === sessionId) {
      return;
    }

    // Update both entities to link them
    await updateSession(sessionId, { albumId }, transaction);
    await updateAlbum(albumId, { sessionId }, transaction);
  });
}

/**
 * Removes the link between a session and album
 * @param sessionId - The ID of the session to delink
 * @param albumId - The ID of the album to delink
 * @throws AlbumSessionLinkingError if they are not linked to each other
 */
export async function delinkSessionAndAlbum(sessionId: string, albumId: string): Promise<void> {
  await runTransaction(db, async (transaction: Transaction) => {
    // Get current session and album data
    const session = await getSessionById(sessionId, transaction);
    const album = await getAlbumById(albumId, transaction);

    // Verify they are actually linked to each other
    if (session.albumId !== albumId || album.sessionId !== sessionId) {
      throw new AlbumSessionLinkingError(
        `Session ${sessionId} and Album ${albumId} are not linked to each other`
      );
    }

    // Remove the links
    await updateSession(sessionId, { albumId: undefined }, transaction);
    await updateAlbum(albumId, { sessionId: undefined }, transaction);
  });
}

/**
 * Delinks a session from its associated album (if any)
 * @param sessionId - The ID of the session to delink
 */
export async function delinkSessionFromAlbum(sessionId: string): Promise<void> {
  await runTransaction(db, async (transaction: Transaction) => {
    const session = await getSessionById(sessionId, transaction);

    if (!session.albumId) {
      return; // No album to delink
    }

    const albumId = session.albumId;

    // Remove the links
    await updateSession(sessionId, { albumId: undefined }, transaction);
    await updateAlbum(albumId, { sessionId: undefined }, transaction);
  });
}

/**
 * Delinks an album from its associated session (if any)
 * @param albumId - The ID of the album to delink
 */
export async function delinkAlbumFromSession(albumId: string): Promise<void> {
  await runTransaction(db, async (transaction: Transaction) => {
    const album = await getAlbumById(albumId, transaction);

    if (!album.sessionId) {
      return; // No session to delink
    }

    const sessionId = album.sessionId;

    // Remove the links
    await updateSession(sessionId, { albumId: undefined }, transaction);
    await updateAlbum(albumId, { sessionId: undefined }, transaction);
  });
}

/**
 * Gets the album associated with a session
 * @param sessionId - The ID of the session
 * @returns The linked album or null if no album is linked
 */
export async function getLinkedAlbum(sessionId: string): Promise<import("@/types/albumTypes").AlbumID | null> {
  const session = await getSessionById(sessionId);

  if (!session.albumId) {
    return null;
  }

  return await getAlbumById(session.albumId);
}

/**
 * Gets the session associated with an album
 * @param albumId - The ID of the album
 * @returns The linked session or null if no session is linked
 */
export async function getLinkedSession(albumId: string): Promise<import("@/types/sessionTypes").SessionID | null> {
  const album = await getAlbumById(albumId);

  if (!album.sessionId) {
    return null;
  }

  return await getSessionById(album.sessionId);
}