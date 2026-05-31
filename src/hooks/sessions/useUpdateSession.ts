import { updateSessionDoc } from "@/data/firestore/sessions";
import { useMutation } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Moment } from "moment";

interface UpdateSessionRequest {
  sessionId: string;
  name?: string;
  startDate?: Moment;
  endDate?: Moment;
}

async function updateSession(req: UpdateSessionRequest) {
  const { sessionId, ...updates } = req;
  await updateSessionDoc(sessionId, {
    name: updates.name,
    startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.toDate()) : undefined,
    endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.toDate()) : undefined
  });
}

export default function useUpdateSession() {
  return useMutation({
    mutationFn: (req: UpdateSessionRequest) => updateSession(req)
  });
}