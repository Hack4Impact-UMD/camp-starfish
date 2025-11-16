import { getAllAttendeesBySession, getNightShiftsBySession } from "@/data/firestore/sessions";
import { useQuery } from "@tanstack/react-query";

const useNightScheduleTable = (sessionID: string) => {
  // Fetch night shifts
  const {
    data: nightShifts,
    isLoading: isLoadingNightShifts,
    error: nightShiftsError,
  } = useQuery({
    queryKey: ["nightShifts", sessionID],
    queryFn: getNightShiftsBySession,
  });

  // Fetch all attendees to map IDs to staff info
  const {
    data: attendeeList,
    isLoading: isLoadingAttendees,
    error: attendeesError,
  } = useQuery({
    queryKey: ["sessionAttendees", sessionID],
    queryFn: getAllAttendeesBySession,
  });

  const isLoading = isLoadingAttendees || isLoadingNightShifts;
  const error = attendeesError || nightShiftsError;

  return {
    nightShifts,
    attendeeList, // Changed to match reference pattern
    isLoading,
    error,
  };
};

export default useNightScheduleTable;