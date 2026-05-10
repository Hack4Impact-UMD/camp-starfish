import { listSectionDocs } from "@/data/firestore/sections";
import { SectionDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useListSections(sessionId: string, firestoreQueryOptions?: FirestoreQueryOptions<SectionDoc>) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['sessions', sessionId, 'sections', firestoreQueryOptions],
    queryFn: async () => {
      const sections = await listSectionDocs(sessionId, firestoreQueryOptions);
      sections.forEach(section => queryClient.setQueryData(['sessions', sessionId, 'sections', section.id], section));
    }
  });
}
