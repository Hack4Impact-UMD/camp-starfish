import {
  createAlbumItemDoc,
  deleteAlbumItemDoc,
  getAlbumItemDoc,
} from "@/data/firestore/albumItems";
import { getFileBlob, uploadFile } from "@/data/storage/storageClientOperations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";

interface MoveAlbumItemRequest {
  fromAlbumId: string;
  albumItemId: string;
  toAlbumId: string;
}

async function moveAlbumItem(req: MoveAlbumItemRequest) {
  const { fromAlbumId, albumItemId, toAlbumId } = req;
  if (fromAlbumId === toAlbumId) return;

  const albumItem = await getAlbumItemDoc(fromAlbumId, albumItemId);
  const blob = await getFileBlob(
    `albums/${fromAlbumId}/albumItems/${albumItemId}`,
  );

  const newAlbumItemId = await createAlbumItemDoc(toAlbumId, {
    name: albumItem.name,
    dateTaken: Timestamp.fromDate(albumItem.dateTaken.toDate()),
    inReview: albumItem.inReview,
    tagIds: albumItem.tagIds,
  });

  try {
    await uploadFile(
      new File([blob], albumItem.name),
      `albums/${toAlbumId}/albumItems/${newAlbumItemId}`,
    );
  } catch {
    await deleteAlbumItemDoc(toAlbumId, newAlbumItemId);
    throw new Error("Failed to move album item");
  }

  // Deleting the source doc triggers the onAlbumItemDeleted Cloud Function,
  // which removes the old Storage file and updates each album's item counts.
  try {
    await deleteAlbumItemDoc(fromAlbumId, albumItemId);
  } catch (error) {
    // Roll back the destination copy so we don't leave a duplicate behind.
    // Deleting the doc triggers the Cloud Function that cleans up its blob.
    try {
      await deleteAlbumItemDoc(toAlbumId, newAlbumItemId);
    } catch {
      // Ignore rollback failure; surface the original error below.
    }
    throw error;
  }
}

export default function useMoveAlbumItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: MoveAlbumItemRequest) => moveAlbumItem(req),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["albums", variables.fromAlbumId, "albumItems"],
      });
      queryClient.invalidateQueries({
        queryKey: ["albums", variables.toAlbumId, "albumItems"],
      });
    },
  });
}
