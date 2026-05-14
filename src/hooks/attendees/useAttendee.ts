import { getAttendeeDoc } from "@/data/firestore/attendees";
import { useQuery } from "@tanstack/react-query";

export default function useAttendee(sessionId: string, attendeeId: number) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'attendees', attendeeId],
    queryFn: () => getAttendeeDoc(attendeeId, sessionId)
  })
}