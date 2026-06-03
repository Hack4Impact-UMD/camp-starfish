import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { arrayRemove, arrayUnion } from "firebase/firestore";

interface ApprovePendingTagRequest {
  albumId: string;
  albumItemId: string;
  tagId: number;
}

async function approvePendingTag(req: ApprovePendingTagRequest) {
  const { albumId, albumItemId, tagId } = req;
  await updateAlbumItemDoc(albumId, albumItemId, {
    "tagIds.approved": arrayUnion(tagId),
    "tagIds.inReview": arrayRemove(tagId)
  });
}

export default function useApprovePendingTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: ApprovePendingTagRequest) => approvePendingTag(req),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums', variables.albumId, 'albumItems', variables.albumItemId] });
    }
  })
}