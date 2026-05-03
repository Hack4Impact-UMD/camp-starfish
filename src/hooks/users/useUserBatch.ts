import { batchGetUserDocs } from "@/data/firestore/users";
import { useQuery } from "@tanstack/react-query";

export default function useUserBatch(userIds: number[]) {
  return useQuery({
    queryKey: ['users', 'batch', userIds],
    queryFn: async ({ client }) => {
      const users = await batchGetUserDocs(userIds);
      users.forEach(user => client.setQueryData(['users', user.id], user));
    },
  })
}