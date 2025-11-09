import { getAllAttendeesBySession } from "@/data/firestore/sessions";
import { Attendee } from "@/types/sessionTypes";
import { useQuery } from "@tanstack/react-query";

const useDirectoryTable = (sessionID: string) => {
  const {
    data: attendeeList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sessionData", sessionID],
    queryFn: getAllAttendeesBySession,
  });

  return {
    attendeeList,
    isLoading,
    error
  }
};

export default useDirectoryTable
