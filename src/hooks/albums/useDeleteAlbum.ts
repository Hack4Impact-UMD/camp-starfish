import { deleteAlbumDoc } from "@/data/firestore/albums";
import { useMutation } from "@tanstack/react-query";

interface UseDeleteAlbumParams {
  albumId: string;
}

export default function useDeleteAlbum() {
  return useMutation({
    mutationFn: (params: UseDeleteAlbumParams) => deleteAlbumDoc(params.albumId)
  })
}