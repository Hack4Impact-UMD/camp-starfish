import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation } from "@tanstack/react-query";

interface ApprovePendingAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

async function approvePendingAlbumItem(req: ApprovePendingAlbumItemRequest) {
  const { albumId, albumItemId } = req;
  await updateAlbumItemDoc(albumId, albumItemId, { inReview: false });
}

export default function useApprovePendingAlbumItem() {
  return useMutation({
    mutationFn: (req: ApprovePendingAlbumItemRequest) => approvePendingAlbumItem(req)
  })
}