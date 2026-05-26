import { db } from "@/config/firebase";
import { deleteAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation } from "@tanstack/react-query";
import { writeBatch } from "firebase/firestore";

interface BatchRejectPendingAlbumItemsRequest {
  albumId: string;
  albumItemIds: string[];
}

async function batchRejectPendingAlbumItems(req: BatchRejectPendingAlbumItemsRequest) {
  const { albumId, albumItemIds } = req;
  const batch = writeBatch(db);
  albumItemIds.forEach(albumItemId => deleteAlbumItemDoc(albumId, albumItemId));
  await batch.commit();
}

export default function useBatchRejectPendingAlbumItems() {
  return useMutation({
    mutationFn: (req: BatchRejectPendingAlbumItemsRequest) => batchRejectPendingAlbumItems(req)
  })
}