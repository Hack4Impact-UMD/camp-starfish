import { deleteAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteAlbumItemRequest {
  albumId: string;
  albumItemId: string;
}

export default function useDeleteAlbumItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: DeleteAlbumItemRequest) => deleteAlbumItemDoc(req.albumId, req.albumItemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums', variables.albumId, 'albumItems'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    }
  })
}