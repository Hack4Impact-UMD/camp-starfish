import { getUserDoc } from "@/data/firestore/users";
import { useQuery } from "@tanstack/react-query";

export default function useUser(userId: number) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserDoc(userId)
  })
}