import { deleteAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation } from "@tanstack/react-query";

interface DeleteAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

export default function useDeleteAlbumItem() {
  return useMutation({
    mutationFn: async (req: DeleteAlbumItemRequest) => deleteAlbumItemDoc(req.albumId, req.albumItemId)
  })
}