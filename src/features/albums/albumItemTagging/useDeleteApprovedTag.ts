import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { useMutation } from "@tanstack/react-query";
import { arrayRemove } from "firebase/firestore";

interface DeleteApprovedTagRequest {
  albumId: string;
  albumItemId: string;
  tagId: number;
}

async function deleteApprovedTag(req: DeleteApprovedTagRequest) {
  const { albumId, albumItemId, tagId } = req;
  await updateAlbumItemDoc(albumId, albumItemId, {
    "tagIds.approved": arrayRemove(tagId)
  });
}

export default function useDeleteApprovedTag() {
  return useMutation({
    mutationFn: (req: DeleteApprovedTagRequest) => deleteApprovedTag(req)
  })
}