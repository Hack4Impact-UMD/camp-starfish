import { useQuery } from "@tanstack/react-query";
import { getSessionDoc } from "@/data/firestore/sessions";

export default function useSession(sessionId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: () => getSessionDoc(sessionId),
  });
}