import { createAlbumDoc } from "@/data/firestore/albums";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { useMutation } from "@tanstack/react-query";

interface UseCreateAlbumParams {
  album: AlbumDoc;
}

export default function useCreateAlbum() {
  return useMutation({
    mutationFn: (params: UseCreateAlbumParams) => createAlbumDoc(params.album)
  })
}