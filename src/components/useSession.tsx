import { db } from "@/config/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { Session } from "@/types/sessionTypes";
import { useQuery } from "@tanstack/react-query";
import { getSessionDates } from "@/data/firestore/sessions";

function useSession(id: string) {
  const sessionsRef = collection(db, "sessions");
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sessionData", id],
    queryFn: getSessionDates,
  });

  return {
    session,
    isLoading,
    error,
  };
}

export default useSession;
