import { useAuth } from "@/auth/useAuth";
import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { AlbumItemTagStatus } from "@/types/albums/albumTypes";
import { Role } from "@/types/users/userTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { arrayUnion } from "firebase/firestore";

interface CreateAlbumItemTagRequest {
  albumId: string;
  albumItemId: string;
  tagIds: number[];
  // ADMIN/PHOTOGRAPHER may choose to add tags as PENDING; defaults to APPROVED.
  status?: AlbumItemTagStatus;
}

async function createAlbumItemTag(req: CreateAlbumItemTagRequest, role: Role | undefined) {
  const { albumId, albumItemId, tagIds, status } = req;
  switch (role) {
    case "ADMIN":
    case "PHOTOGRAPHER":
      await updateAlbumItemDoc(
        albumId,
        albumItemId,
        status === "PENDING"
          ? { "tagIds.inReview": arrayUnion(...tagIds) }
          : { "tagIds.approved": arrayUnion(...tagIds) },
      );
      break;
    case "STAFF":
      await updateAlbumItemDoc(albumId, albumItemId, { "tagIds.inReview": arrayUnion(...tagIds) });
      break;
    case "CAMPER":
    case "PARENT":
    default:
      throw new Error("User does not have permission to create an album item tag.");
  }
}

export default function useCreateAlbumItemTag() {
  const auth = useAuth();
  const role = auth.token?.claims.role as Role | undefined;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateAlbumItemTagRequest) => createAlbumItemTag(req, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums', variables.albumId, 'albumItems', variables.albumItemId] });
    }
  });
}