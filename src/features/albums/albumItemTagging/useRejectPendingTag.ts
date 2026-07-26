import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import useAlbumItemTagMutation from "@/features/albums/albumItemTagging/useAlbumItemTagMutation";
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
  return useAlbumItemTagMutation((req: RejectPendingTagRequest) => rejectPendingTag(req));
}