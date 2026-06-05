import { getAllUsers } from "@/data/firestore/users";
import { useQuery } from "@tanstack/react-query";

export default function useUsers(enabled: boolean = true) {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled,
  });
}
