import { batchGetProgramAreaDocs } from "@/data/firestore/programAreas";
import { ProgramArea } from "@/types/scheduling/schedulingTypes";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useProgramAreaBatch(ids: string[]) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['programAreas', ids],
    queryFn: ids.length > 0 ? (async () => {
      const queryIds = ids.filter(id => !queryClient.getQueryData(['programAreas', id]));
      const programAreas = await batchGetProgramAreaDocs(queryIds);
      programAreas.forEach(programArea => queryClient.setQueryData(['programAreas', programArea.id], programArea));
      return ids.map(id => queryClient.getQueryData(['programAreas', id]) as ProgramArea);
    }) : skipToken
  })
}