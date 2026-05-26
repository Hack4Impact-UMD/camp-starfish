import { deleteAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation } from "@tanstack/react-query";

interface RejectPendingAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

async function rejectPendingAlbumItem(req: RejectPendingAlbumItemRequest) {
  const { albumId, albumItemId } = req;
  await deleteAlbumItemDoc(albumId, albumItemId);
}

export default function useRejectPendingAlbumItem() {
  return useMutation({
    mutationFn: (req: RejectPendingAlbumItemRequest) => rejectPendingAlbumItem(req)
  })
}