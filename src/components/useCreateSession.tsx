import { db } from "@/config/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { Session } from "@/types/sessionTypes";
import { useQuery } from "@tanstack/react-query";

function useCreateSession() {
  const sessionsRef = collection(db, "sessions");
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sessionData"],
    queryFn: async () => {
      const sessionRef = doc(db, "sessions", "session1");
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) throw new Error("Session does not exist");
      return sessionSnap.data() as Session;
    },
  });

  return {
    startDate: session?.startDate,
    endDate: session?.endDate,
    isLoading,
    error,
  };
}

export default useCreateSession;
