import { batchGetPersonDocs } from "@/data/firestore/people";
import { useQuery } from "@tanstack/react-query";

export default function usePersonBatch(personIds: number[]) {
  return useQuery({
    queryKey: ['people', 'batch', personIds],
    queryFn: async ({ client }) => {
      const people = await batchGetPersonDocs(personIds);
      people.forEach(person => client.setQueryData(['people', person.id], person));
    },
  })
}