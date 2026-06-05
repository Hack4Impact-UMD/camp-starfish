import { UserDoc } from "@/data/firestore/types/documents";
import { FirestoreQueryOptions } from "@/data/firestore/types/queries";
import { listUserDocs } from "@/data/firestore/users";
import { useQuery } from "@tanstack/react-query";

export default function useUserList(firestoreQueryOptions: FirestoreQueryOptions<UserDoc> = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["users", "list", firestoreQueryOptions],
    queryFn: () => listUserDocs(firestoreQueryOptions),
    enabled,
  });
}
