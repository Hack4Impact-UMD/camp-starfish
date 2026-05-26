import { db } from "@/config/firebase";
import { deleteAlbumItemDoc, updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation } from "@tanstack/react-query";
import { writeBatch } from "firebase/firestore";

interface BatchApprovePendingAlbumItemsRequest {
  albumId: string;
  albumItemIds: string[];
}

async function batchApprovePendingAlbumItems(req: BatchApprovePendingAlbumItemsRequest) {
  const { albumId, albumItemIds } = req;
  const batch = writeBatch(db);
  albumItemIds.forEach(albumItemId => updateAlbumItemDoc(albumId, albumItemId, { inReview: false }));
  await batch.commit();
}

export default function useBatchApprovePendingAlbumItems() {
  return useMutation({
    mutationFn: (req: BatchApprovePendingAlbumItemsRequest) => batchApprovePendingAlbumItems(req)
  })
}