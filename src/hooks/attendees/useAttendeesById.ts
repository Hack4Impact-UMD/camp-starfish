import { useQuery } from "@tanstack/react-query";
import { getAttendeeById } from "@/data/firestore/attendees";
import { AttendeeID } from "@/types/sessionTypes";

export default function useAttendeeNames(sessionId: string, attendees: number[], type?: string) {
  return useQuery<string[]>({
    queryKey: ['sessions', sessionId, type ?? 'attendeeNames', ...attendees],
    queryFn: async () => {
      const results = await Promise.all(
        attendees.map(att => getAttendeeById(att, sessionId))
      );

      return results.map(att => {
        const { firstName, middleName, lastName } = att.name;
        return [firstName, lastName.slice(0,1)].filter(Boolean).join(' ');
      });
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!sessionId && attendees.length > 0,
  });
}
