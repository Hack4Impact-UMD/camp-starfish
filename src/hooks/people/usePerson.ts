import { getPersonDoc } from "@/data/firestore/people";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function getUsePersonOptions(personId: number) {
  return queryOptions({
    queryKey: ['person', personId],
    queryFn: () => getPersonDoc(personId)
  });
}

export default function usePerson(personId: number) {
  return useQuery(getUsePersonOptions(personId));
}