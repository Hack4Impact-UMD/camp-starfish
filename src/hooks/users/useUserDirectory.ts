import { executeUserDirectoryQuery } from "@/data/firestore/userDirectory";
import { UserDirectory } from "@/types/albums/albumTypes";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function getFullUserDirectory(): Promise<Omit<UserDirectory, 'page'>> {
  const pages = await executeUserDirectoryQuery();
  const fullDirectory = pages.reduce((acc, page) => ({ ...acc, ...page }), {});
  // @ts-expect-error - Typescript doesn't recognize arbitrary keys
  delete fullDirectory.page;
  return fullDirectory;
}

export function getUseUserDirectoryOptions() {
  return queryOptions({
    queryKey: ['user-directory'],
    queryFn: getFullUserDirectory,
  })
}

export default function useUserDirectory() {
  return useQuery(getUseUserDirectoryOptions());
}