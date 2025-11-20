import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/data/firestore/sessions";

export default function useSession(sessionId: string) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSessionById(sessionId),
  });
}