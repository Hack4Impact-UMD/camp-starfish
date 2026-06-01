import { db } from "@/config/firebase";
import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { AlbumItemDoc } from "@/data/firestore/types/documents";
import { useMutation } from "@tanstack/react-query";
import { arrayRemove, arrayUnion, UpdateData, writeBatch } from "firebase/firestore";

interface UpdateAlbumItemRequest {
  albumId: string;
  albumItemId: string;
  name?: string;
  inReview?: boolean;
  tagIds?: {
    approved?: {
      add?: number[];
      remove?: number[];
    };
    inReview?: {
      add?: number[];
      remove?: number[];
    };
  }
}

function getTagChanges(tagUpdates: UpdateAlbumItemRequest['tagIds']): UpdateData<AlbumItemDoc>[] {
  const tagChanges: UpdateData<AlbumItemDoc>[] = [{}, {}];
  if (tagUpdates?.approved) {
    if (tagUpdates.approved.add) {
      tagChanges[0] = {
        ...tagChanges[0],
        "tagIds.approved": arrayUnion(...tagUpdates.approved.add)
      };
    }
    if (tagUpdates.approved.remove) {
      tagChanges[1] = {
        ...tagChanges[1],
        "tagIds.approved": arrayRemove(...tagUpdates.approved.remove)
      }
    }
  }
  if (tagUpdates?.inReview) {
    if (tagUpdates.inReview.add) {
      tagChanges[0] = {
        ...tagChanges[0],
        "tagIds.inReview": arrayUnion(...tagUpdates.inReview.add)
      };
    }
    if (tagUpdates.inReview.remove) {
      tagChanges[1] = {
        ...tagChanges[1],
        "tagIds.inReview": arrayRemove(...tagUpdates.inReview.remove)
      }
    }
  }
  return tagChanges.filter(tagChange => Object.keys(tagChange).length !== 0);
}

async function updateAlbumItem(req: UpdateAlbumItemRequest) {
  const { albumId, albumItemId } = req;
  const tagChanges = getTagChanges(req.tagIds);
  const needsWriteBatch = tagChanges.length > 1;

  if (needsWriteBatch) {
    const batch = writeBatch(db);
    await updateAlbumItemDoc(albumId, albumItemId, {
      name: req.name,
      inReview: req.inReview,
      ...tagChanges[0]
    }, batch);
    await updateAlbumItemDoc(albumId, albumItemId, tagChanges[1], batch);
    await batch.commit();
  } else {
    await updateAlbumItemDoc(albumId, albumItemId, {
      name: req.name,
      inReview: req.inReview,
      ...tagChanges[0]
    })
  }
}

export default function useUpdateAlbumItem() {
  return useMutation({
    mutationFn: async (req: UpdateAlbumItemRequest) => updateAlbumItem(req)
  });
}