import { getAlbums } from "@/data/firestore/albums";
import { useQuery } from "@tanstack/react-query";

export default function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: () => getAlbums(),
  })
}