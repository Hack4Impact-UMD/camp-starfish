import { useQuery } from "@tanstack/react-query";
import { getAttendeesBySessionId } from "@/data/firestore/attendees";
import { Attendee } from "@/types/sessions/sessionTypes";

export default function useAttendeesBySessionId(sessionId: string) {
    return useQuery<Attendee[]>({
        queryKey: ['sessions', sessionId, 'attendees'],
        queryFn: () => getAttendeesBySessionId(sessionId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        enabled: !!sessionId
    });
}
