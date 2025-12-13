import { db } from "@/config/firebase";
import { getAlbumById, updateAlbum } from "@/data/firestore/albums";
import { getSessionById, updateSession } from "@/data/firestore/sessions";
import { useMutation } from "@tanstack/react-query";
import { runTransaction, Transaction } from "firebase/firestore";

export default async function linkAlbumAndSession(albumId: string, sessionId: string) {
  await runTransaction(db, async (transaction: Transaction) => {
    const session = await getSessionById(sessionId, transaction);
    const album = await getAlbumById(albumId, transaction);

    if (session.albumId === albumId && album.sessionId === sessionId) {
      return;
    } else if (session.albumId) {
      throw Error(`Session ${sessionId} is already linked to album ${session.albumId}`);
    } else if (album.sessionId) {
      throw Error(`Album ${albumId} is already linked to session ${album.sessionId}`);
    }

    await updateSession(sessionId, { albumId }, transaction);
    await updateAlbum(albumId, { sessionId }, transaction);
  });
}

interface UseLinkAlbumAndSessionVars {
  albumId: string;
  sessionId: string;
}

export function useLinkAlbumAndSession() {
  return useMutation({
    mutationFn: ({ albumId, sessionId }: UseLinkAlbumAndSessionVars) => linkAlbumAndSession(albumId, sessionId)
  })
}