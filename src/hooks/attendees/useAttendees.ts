import { useQuery } from "@tanstack/react-query";
import { getAllAttendeesBySessionId } from "@/data/firestore/attendees";
import { AttendeeID } from "@/types/sessionTypes";

export function useAttendees(sessionId: string) {
    return useQuery<AttendeeID[]>({
        queryKey: ['sessions', sessionId, 'attendees'],
        queryFn: () => getAllAttendeesBySessionId(sessionId), 
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        enabled: !!sessionId
    });
}
