import { getAllAttendeesBySession, getNightShiftsBySession } from "@/data/firestore/sessions";
import { NightShiftID, AttendeeID } from '@/types/sessionTypes';
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";

export const useAttendeesBySessionId = (sessionID: string) => {
  // Define a wrapper function to handle the QueryContext
  const fetchAttendees = (context: QueryFunctionContext) => {
    const queryKey = context.queryKey as [string, string];
    return getAllAttendeesBySession({ queryKey });
  };
    
  return useQuery<AttendeeID[], Error>({
    queryKey: ["sessionAttendees", sessionID],
    queryFn: fetchAttendees, // Pass the wrapper function
  });
};

export const useNightShiftsBySessionId = (sessionID: string) => {
  const fetchNightShifts = (context: QueryFunctionContext) => {

    const queryKey = context.queryKey as [string, string];
    return getNightShiftsBySession({ queryKey });
  };

  return useQuery<NightShiftID[], Error>({
    queryKey: ["nightShifts", sessionID],
    queryFn: fetchNightShifts, // Pass the wrapper function
  });
};

const useNightScheduleData = (sessionID: string) => {

  const nightShiftsQuery = useNightShiftsBySessionId(sessionID);
  const attendeesQuery = useAttendeesBySessionId(sessionID);

  // Consolidate the return object
  return {
    nightShifts: nightShiftsQuery.data,
    attendeeList: attendeesQuery.data,
    isLoading: nightShiftsQuery.isLoading || attendeesQuery.isLoading,
    error: nightShiftsQuery.error || attendeesQuery.error,
    nightShiftsQuery,
    attendeesQuery,
  };
}

export default useNightScheduleData;