import { listSectionDocs } from "@/data/firestore/sections";
import { SectionDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { useQuery } from "@tanstack/react-query";

export default function useSectionList(sessionId: string, firestoreQueryOptions?: FirestoreQueryOptions<SectionDoc>) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', firestoreQueryOptions],
    queryFn: async ({ client }) => {
      const sections = await listSectionDocs(sessionId, firestoreQueryOptions);
      sections.forEach(section => client.setQueryData(['sessions', sessionId, 'sections', section.id], section));
      return sections;
    }
  });
}
