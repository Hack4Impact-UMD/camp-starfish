import { listProgramAreaDocs } from "@/data/firestore/programAreas";
import { ProgramAreaDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { ProgramArea } from "@/types/scheduling/schedulingTypes";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";
import { flattenFirestoreInfiniteData } from "../utils";

export function programAreaListQueryOptions(firestoreQueryOptions: FirestoreQueryOptions<ProgramAreaDoc> = {}) {
  return infiniteQueryOptions({
    queryKey: ['programAreas', firestoreQueryOptions],
    queryFn: async ({ pageParam, client }) => {
      const updatedQueryOptions = firestoreQueryOptions ? { ...firestoreQueryOptions } : {};
      if (pageParam) {
        if (pageParam.direction === 'next') {
          updatedQueryOptions.startAfter = pageParam.snapshot;
          updatedQueryOptions.startAt = undefined;
        } else {
          updatedQueryOptions.endBefore = pageParam.snapshot;
          updatedQueryOptions.endAt = undefined;
        }
      }
      const programAreasPage = await listProgramAreaDocs(updatedQueryOptions);
      programAreasPage.docs.forEach((programArea: ProgramArea) => client.setQueryData(['programAreas', programArea.id], programArea));
      return programAreasPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<ProgramAreaDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
    select: flattenFirestoreInfiniteData,
  });
}

export default function useProgramAreaList(firestoreQueryOptions: FirestoreQueryOptions<ProgramAreaDoc> = {}) {
  return useInfiniteQuery(programAreaListQueryOptions(firestoreQueryOptions));
}