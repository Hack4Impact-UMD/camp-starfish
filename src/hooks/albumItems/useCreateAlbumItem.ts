import { createAlbumItemDoc, deleteAlbumItemDoc } from "@/data/firestore/albumItems";
import { uploadFile } from "@/data/storage/storageClientOperations";
import { useMutation } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import moment from "moment";

interface CreateAlbumItemRequest {
  albumId: string;
  albumItem: File;
  inReview: boolean;
}

async function createAlbumItem(req: CreateAlbumItemRequest) {
  const { albumId } = req;
  const albumItemId = await createAlbumItemDoc(albumId, {
    name: req.albumItem.name,
    dateTaken: Timestamp.fromDate(moment(req.albumItem.lastModified).toDate()),
    inReview: req.inReview,
    tagIds: {
      approved: [],
      inReview: []
    }
  });
  try {
    await uploadFile(req.albumItem, `albums/${albumId}/albumItems/${albumItemId}`);
    return albumItemId;
  } catch {
    await deleteAlbumItemDoc(albumId, albumItemId);
    throw Error("Failed to create album item");
  }
}

export default function useCreateAlbumItem() {
  return useMutation({
    mutationFn: async (req: CreateAlbumItemRequest) => createAlbumItem(req)
  })
}