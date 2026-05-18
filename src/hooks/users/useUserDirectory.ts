import { executeUserDirectoryQuery } from "@/data/firestore/userDirectory";
import { UserDirectory } from "@/types/albums/albumTypes";
import { useQuery } from "@tanstack/react-query";

export async function getUserDirectory(): Promise<Omit<UserDirectory, 'page'>> {
  const pages = await executeUserDirectoryQuery();
  const combinedTags = pages.reduce((acc, page) => ({ ...acc, ...page }), {});
  // @ts-expect-error - Typescript doesn't recognize arbitrary keys
  delete combinedTags.page;
  return combinedTags;
}

export default function useUserDirectory() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getUserDirectory
  })
}