import { deleteAlbum } from "@/data/firestore/albums";
import { useMutation } from "@tanstack/react-query";

interface UseDeleteAlbumParams {
  albumId: string;
}

export default function useDeleteAlbum() {
  return useMutation({
    mutationFn: (params: UseDeleteAlbumParams) => deleteAlbum(params.albumId)
  })
}