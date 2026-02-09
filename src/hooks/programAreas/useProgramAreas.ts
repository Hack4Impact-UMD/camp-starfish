import { getProgramAreasByIds } from "@/data/firestore/programAreas";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useProgramAreas(ids: string[]) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['programAreas', ids],
    queryFn: async () => {
      const programAreas = await getProgramAreasByIds(ids);
      programAreas.forEach(programArea => queryClient.setQueryData(['programAreas', programArea.id], programArea));
      return programAreas;
    },
    enabled: !!ids.length
  })
}