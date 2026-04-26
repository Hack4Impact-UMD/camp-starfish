import { getProgramAreasByIds } from "@/data/firestore/programAreas";
import { ProgramArea } from "@/types/scheduling/schedulingTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useProgramAreas(ids: string[]) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['programAreas', ids],
    queryFn: async () => {
      const queryIds = ids.filter(id => !queryClient.getQueryData(['programAreas', id]));
      const programAreas = await getProgramAreasByIds(queryIds);
      programAreas.forEach(programArea => queryClient.setQueryData(['programAreas', programArea.id], programArea));
      return ids.map(id => queryClient.getQueryData(['programAreas', id]) as ProgramArea);
    },
    enabled: !!ids.length
  })
}