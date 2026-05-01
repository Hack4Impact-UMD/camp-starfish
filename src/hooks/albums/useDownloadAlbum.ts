import { downloadAlbum } from "@/features/albums/downloadAlbum";
import { Album } from "@/types/albums/albumTypes";
import { useMutation } from "@tanstack/react-query";

export default function useDownloadAlbum() {
  return useMutation({
    mutationKey: ["albums", "download"],
    mutationFn: (album: Album) => downloadAlbum(album),
  });
}
