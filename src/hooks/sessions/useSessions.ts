import { useQuery } from "@tanstack/react-query";
import { getAllSessions } from "@/data/firestore/sessions";
import { SessionID } from "@/types/sessionTypes";

export function useSessions() {
    return useQuery<SessionID[]>({
        queryKey: ["sessions"],
        queryFn: getAllSessions,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
}
