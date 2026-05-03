import { executeTagDirectoryQuery } from "@/data/firestore/tagDirectory";
import { TagDirectory } from "@/types/albums/albumTypes";
import { useQuery } from "@tanstack/react-query";

export async function getAllTags(): Promise<TagDirectory> {
  const pages = await executeTagDirectoryQuery();
  const combinedTags = pages.reduce((acc, page) => ({ ...acc, ...page }), {});
  return {
    ...combinedTags,
    page: -1
  }
}

export default function useAllTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags
  })
}