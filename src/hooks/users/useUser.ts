import { getUserDoc } from "@/data/firestore/users";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function getUseUserOptions(userId: number) {
  return queryOptions({
    queryKey: ['user', userId],
    queryFn: () => getUserDoc(userId)
  });
}

export default function useUser(userId: number) {
  return useQuery(getUseUserOptions(userId));
}