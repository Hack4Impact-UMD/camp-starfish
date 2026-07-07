import { executeUserDirectoryQuery } from "@/data/firestore/userDirectory";
import { UserDirectory } from "@/types/albums/albumTypes";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export async function getFullUserDirectory(): Promise<Omit<UserDirectory, 'page'>> {
  const pages = await executeUserDirectoryQuery();
  const fullDirectory = pages.reduce((acc, page) => ({ ...acc, ...page }), {});
  // @ts-expect-error - Typescript doesn't recognize arbitrary keys
  delete fullDirectory.page;
  return fullDirectory;
}

export default function useUserDirectory(tanstackQueryOptions: Omit<UseQueryOptions<Awaited<ReturnType<typeof getFullUserDirectory>>>, "queryKey" | "queryFn"> = {}) {
  return useQuery({
    queryKey: ['user-directory'],
    queryFn: getFullUserDirectory,
    ...tanstackQueryOptions,
  })
}