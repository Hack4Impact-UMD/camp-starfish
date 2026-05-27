import { getProgramAreaDoc } from "@/data/firestore/programAreas";
import { useQuery } from "@tanstack/react-query";

export default function useProgramArea(id: string) {
  return useQuery({
    queryKey: ['programAreas', id],
    queryFn: () => getProgramAreaDoc(id),
  })
}