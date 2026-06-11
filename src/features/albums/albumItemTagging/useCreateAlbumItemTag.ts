import { useAuth } from "@/auth/useAuth";
import { updateAlbumItemDoc } from "@/data/firestore/albumItems";
import { Role } from "@/types/users/userTypes";
import { useMutation } from "@tanstack/react-query";
import { arrayUnion } from "firebase/firestore";

interface CreateAlbumItemTagRequest {
  albumId: string;
  albumItemId: string;
  tagIds: number[];
}

async function createAlbumItemTag(req: CreateAlbumItemTagRequest, role: Role | undefined) {
  const { albumId, albumItemId } = req;
  switch (role) {
    case "ADMIN":
    case "PHOTOGRAPHER":
      await updateAlbumItemDoc(albumId, albumItemId, { "tagIds.approved": arrayUnion(...req.tagIds) });
      break;
    case "STAFF":
      await updateAlbumItemDoc(albumId, albumItemId, { "tagIds.inReview": arrayUnion(...req.tagIds) });
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
  return useMutation({
    mutationFn: (req: CreateAlbumItemTagRequest) => createAlbumItemTag(req, role)
  });
}