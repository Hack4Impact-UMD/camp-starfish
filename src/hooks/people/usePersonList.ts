import { PersonDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { listPersonDocs } from "@/data/firestore/people";
import { useQuery } from "@tanstack/react-query";

export default function usePersonList(firestoreQueryOptions: FirestoreQueryOptions<PersonDoc> = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["people", "list", firestoreQueryOptions],
    queryFn: () => listPersonDocs(firestoreQueryOptions),
    enabled,
  });
}
