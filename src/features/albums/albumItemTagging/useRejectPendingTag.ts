import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { arrayRemove } from "firebase/firestore";

interface RejectPendingTagRequest {
  albumId: string;
  albumItemId: string;
  tagId: number;
}

async function rejectPendingTag(req: RejectPendingTagRequest) {
  const { albumId, albumItemId, tagId } = req;
  await updateAlbumItemDoc(albumId, albumItemId, {
    "tagIds.inReview": arrayRemove(tagId)
  });
}

export default function useRejectPendingTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: RejectPendingTagRequest) => rejectPendingTag(req),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums', variables.albumId, 'albumItems', variables.albumItemId] });
    }
  })
}