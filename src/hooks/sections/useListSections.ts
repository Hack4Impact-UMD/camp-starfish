import { listSectionDocs } from "@/data/firestore/sections";
import { SectionDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useListSections(sessionId: string, firestoreQueryOptions?: FirestoreQueryOptions<SectionDoc>) {
  const queryClient = useQueryClient();

  return useQuery({
    // 'list' discriminator keeps this key from colliding with useSection's
    // ['sessions', sessionId, 'sections', sectionId] when both the options here
    // and that sectionId are undefined (e.g. EditSectionModal in create mode),
    // which would otherwise share a query whose queryFn is skipToken. The
    // ['sessions', sessionId, 'sections'] prefix still matches for invalidation.
    queryKey: ['sessions', sessionId, 'sections', 'list', firestoreQueryOptions],
    queryFn: async () => {
      const sections = await listSectionDocs(sessionId, firestoreQueryOptions);
      sections.forEach(section => queryClient.setQueryData(['sessions', sessionId, 'sections', section.id], section));
      return sections;
    }
  });
}
