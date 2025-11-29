import { useQuery } from "@tanstack/react-query";
import { getAllAttendees } from "@/data/firestore/attendees";
import { AttendeeID } from "@/types/sessionTypes";

export function useAttendees(sessionId: string) {
    return useQuery<AttendeeID[]>({
        queryKey: ["attendees"],
        queryFn: () => getAllAttendees(sessionId), 
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
}
