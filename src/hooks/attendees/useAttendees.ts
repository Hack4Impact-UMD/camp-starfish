import { useQuery } from "@tanstack/react-query";
import { getAllAttendees } from "@/data/firestore/attendees";
import { AttendeeID } from "@/types/sessionTypes";
import { s } from "framer-motion/dist/types.d-DDSxwf0n";

export function useAttendees(sessionId: string) {
    return useQuery<AttendeeID[]>({
        queryKey: ["attendees"],
        queryFn: () => getAllAttendees(sessionId), 
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
}
