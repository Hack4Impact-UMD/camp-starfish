import { db } from "@/config/firebase";
import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { writeBatch } from "firebase/firestore";
import { getUseAlbumItemListOptions } from "../useAlbumItemList";

type ApprovePendingAlbumItemsRequest =
  | {
    albumId: string;
    albumItemId: string;
    albumItemIds?: never;
  }
  | {
    albumId: string;
    albumItemIds: string[];
    albumItemId?: never;
  }
  | {
    albumId: string;
    albumItemId?: never;
    albumItemIds?: never;
  };

async function approvePendingAlbumItems(req: ApprovePendingAlbumItemsRequest, client: QueryClient) {
  const { albumId } = req;
  if (req.albumItemId !== undefined) {
    const { albumItemId } = req;
    await updateAlbumItemDoc(albumId, albumItemId, { inReview: false });
    return;
  }

  let albumItemIds = [];
  if (req.albumItemIds) {
    albumItemIds = req.albumItemIds;
  } else {
    const albumItemListQuery = await client.fetchInfiniteQuery(getUseAlbumItemListOptions(albumId, { where: [{ fieldPath: "inReview", operation: "==", value: true }] }));
    albumItemIds = albumItemListQuery.pages.flatMap(page => page.docs).map(albumItem => albumItem.id);
  }

  if (albumItemIds.length === 0) return;

  const batch = writeBatch(db);
  albumItemIds.forEach(albumItemId => updateAlbumItemDoc(albumId, albumItemId, { inReview: false }, batch));
  await batch.commit();
}

export default function useApprovePendingAlbumItems() {
  return useMutation({
    mutationFn: (req: ApprovePendingAlbumItemsRequest, { client }) => approvePendingAlbumItems(req, client)
  })
}