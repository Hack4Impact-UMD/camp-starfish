import { executeTagDirectoryQuery } from "@/data/firestore/tagDirectory";
import { useQuery } from "@tanstack/react-query";

export async function getAllTags() {
  return await executeTagDirectoryQuery();
}

export default function useAllTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags
  })
}