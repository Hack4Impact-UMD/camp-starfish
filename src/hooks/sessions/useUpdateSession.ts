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
    startDate: updates.startDate ? Timestamp.fromDate(updates.startDate.clone().startOf('day').toDate()) : undefined,
    endDate: updates.endDate ? Timestamp.fromDate(updates.endDate.clone().endOf('day').toDate()) : undefined
  });
}

export default function useUpdateSession() {
  return useMutation({
    mutationFn: (req: UpdateSessionRequest) => updateSession(req),
    onSuccess: (_data, _vars, _result, { client }) => {
      client.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
}