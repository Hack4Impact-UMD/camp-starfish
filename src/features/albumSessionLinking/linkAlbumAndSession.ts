import { db } from "@/config/firebase";
import { getAlbumDoc, updateAlbumDoc } from "@/data/firestore/albums";
import { getSessionDoc, updateSessionDoc } from "@/data/firestore/sessions";
import { useMutation } from "@tanstack/react-query";
import { runTransaction, Transaction } from "firebase/firestore";

export default async function linkAlbumAndSession(albumId: string, sessionId: string) {
  await runTransaction(db, async (transaction: Transaction) => {
    const session = await getSessionDoc(sessionId, transaction);
    const album = await getAlbumDoc(albumId, transaction);

    if (session.linkedAlbumId === albumId && album.linkedSessionId === sessionId) {
      return;
    } else if (session.linkedAlbumId && session.linkedAlbumId !== albumId) {
      throw Error(`Session ${sessionId} is already linked to album ${session.linkedAlbumId}`);
    } else if (album.linkedSessionId && album.linkedSessionId !== sessionId) {
      throw Error(`Album ${albumId} is already linked to session ${album.linkedSessionId}`);
    }

    await updateSessionDoc(sessionId, { linkedAlbumId: albumId }, transaction);
    await updateAlbumDoc(albumId, { linkedSessionId: sessionId }, transaction);
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