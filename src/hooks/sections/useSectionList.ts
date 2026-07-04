import { listSectionDocs } from "@/data/firestore/sections";
import { SectionDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { Section } from "@/types/sessions/sessionTypes";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { TanstackQueryFirestorePageParam } from "../types/tanstackQueryTypes";

export function getUseSectionListOptions(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<SectionDoc> = {}) {
  return infiniteQueryOptions({
    queryKey: ['sessions', sessionId, 'sections', firestoreQueryOptions],
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
      const sectionsPage = await listSectionDocs(sessionId, updatedQueryOptions);
      sectionsPage.docs.forEach((section: Section) => client.setQueryData(['sessions', sessionId, 'sections', section.id], section));
      return sectionsPage;
    },
    initialPageParam: undefined as TanstackQueryFirestorePageParam<SectionDoc> | undefined,
    getPreviousPageParam: (firstPage) => firstPage.firstSnapshot ? ({ direction: 'previous' as const, snapshot: firstPage.firstSnapshot }) : undefined,
    getNextPageParam: (lastPage) => lastPage.lastSnapshot ? ({ direction: 'next' as const, snapshot: lastPage.lastSnapshot }) : undefined,
  });
}

export default function useSectionList(sessionId: string, firestoreQueryOptions: FirestoreQueryOptions<SectionDoc> = {}) {
  return useInfiniteQuery(getUseSectionListOptions(sessionId, firestoreQueryOptions));
}