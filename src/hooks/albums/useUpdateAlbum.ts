import { updateAlbumDoc } from "@/data/firestore/albums";
import { AlbumDoc } from "@/data/firestore/types/documents";
import { useMutation } from "@tanstack/react-query";

interface UseUpdateAlbumParams {
  albumId: string;
  updates: Partial<AlbumDoc>;
}

export default function useUpdateAlbum() {
  return useMutation({
    mutationFn: (params: UseUpdateAlbumParams) => updateAlbumDoc(params.albumId, params.updates)
  })
}