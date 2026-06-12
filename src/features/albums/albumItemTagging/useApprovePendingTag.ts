import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import useAlbumItemTagMutation from "@/features/albums/albumItemTagging/useAlbumItemTagMutation";
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
  return useAlbumItemTagMutation((req: ApprovePendingTagRequest) => approvePendingTag(req));
}