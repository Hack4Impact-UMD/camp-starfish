import { db } from "@/config/firebase";
import { getAlbumDoc, updateAlbumDoc } from "@/data/firestore/albums";
import { getSessionById, updateSession } from "@/data/firestore/sessions";
import { useMutation } from "@tanstack/react-query";
import { deleteField, runTransaction, Transaction } from "firebase/firestore";

type UseUnlinkAlbumAndSessionVars = {
  albumId: string;
  sessionId: string;
}

export default async function unlinkAlbumAndSession(albumId: string, sessionId: string) {
  await runTransaction(db, async (transaction: Transaction) => {
    const session = await getSessionById(sessionId, transaction);
    const album = await getAlbumDoc(albumId, transaction);

    if (session.linkedAlbumId !== albumId || album.linkedSessionId !== sessionId) {
      throw Error(`Session ${sessionId} and Album ${albumId} are not linked to each other`);
    }

    await updateSession(sessionId, { linkedAlbumId: deleteField() }, transaction);
    await updateAlbumDoc(albumId, { linkedSessionId: deleteField() }, transaction);
  });
}

export function useUnlinkAlbumAndSession() {
  return useMutation({
    mutationFn: ({ albumId, sessionId }: UseUnlinkAlbumAndSessionVars) => unlinkAlbumAndSession(albumId, sessionId)
  })
}