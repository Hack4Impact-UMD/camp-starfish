import { getAlbums } from "@/data/firestore/albums";
import { Album } from "@/types/albums/albumTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useAlbums() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const albums = await getAlbums();
      albums.forEach((album: Album) => queryClient.setQueryData(['albums', album.id], album));
      return albums;
    },
  })
}