import { useQuery } from "@tanstack/react-query";
import { listSessionDocs } from "@/data/firestore/sessions";
import { Session } from "@/types/sessions/sessionTypes";

export function useSessions() {
    return useQuery<Session[]>({
        queryKey: ["sessions"],
        queryFn: listSessionDocs,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
}
