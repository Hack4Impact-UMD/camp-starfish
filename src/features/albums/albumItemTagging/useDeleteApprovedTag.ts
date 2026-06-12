import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import useAlbumItemTagMutation from "@/features/albums/albumItemTagging/useAlbumItemTagMutation";
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
  return useAlbumItemTagMutation((req: DeleteApprovedTagRequest) => deleteApprovedTag(req));
}