import { deleteAlbumDoc } from "@/data/firestore/albums";
import { useMutation } from "@tanstack/react-query";

interface DeleteAlbumRequest {
  albumId: string;
}

async function deleteAlbum(req: DeleteAlbumRequest) {
  const { albumId } = req;
  await deleteAlbumDoc(albumId);
}

export default function useDeleteAlbum() {
  return useMutation({
    mutationFn: (req: DeleteAlbumRequest) => deleteAlbum(req)
  })
}