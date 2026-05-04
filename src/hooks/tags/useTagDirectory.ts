import { executeTagDirectoryQuery } from "@/data/firestore/tagDirectory";
import { TagDirectory } from "@/types/albums/albumTypes";
import { useQuery } from "@tanstack/react-query";

export async function getTagDirectory(): Promise<Omit<TagDirectory, 'page'>> {
  const pages = await executeTagDirectoryQuery();
  const combinedTags = pages.reduce((acc, page) => ({ ...acc, ...page }), {});
  // @ts-expect-error - Typescript doesn't recognize arbitrary keys
  delete combinedTags.page;
  return combinedTags;
}

export default function useTagDirectory() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTagDirectory
  })
}