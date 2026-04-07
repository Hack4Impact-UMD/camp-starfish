import { getAllUsers } from "@/data/firestore/users";
import { useQuery } from "@tanstack/react-query";

export default function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });
}
