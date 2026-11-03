import { executePersonDirectoryQuery } from "@/data/firestore/personDirectory";
import { PersonDirectory } from "@/types/sessions/sessionTypes";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function getFullPersonDirectory(): Promise<Omit<PersonDirectory, 'page'>> {
  const pages = await executePersonDirectoryQuery();
  const fullDirectory = pages.reduce((acc, page) => ({ ...acc, ...page }), {});
  // @ts-expect-error - Typescript doesn't recognize arbitrary keys
  delete fullDirectory.page;
  return fullDirectory;
}

export function getUsePersonDirectoryOptions() {
  return queryOptions({
    queryKey: ['person-directory'],
    queryFn: getFullPersonDirectory,
  })
}

export default function usePersonDirectory() {
  return useQuery(getUsePersonDirectoryOptions());
}