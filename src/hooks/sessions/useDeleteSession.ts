import { useMutation } from "@tanstack/react-query";
import { deleteSessionDoc } from "@/data/firestore/sessions";

interface DeleteSessionRequest {
  sessionId: string;
}

async function deleteSession(req: DeleteSessionRequest) {
  await deleteSessionDoc(req.sessionId);
}

export function useDeleteSession() {
  return useMutation({
    mutationFn: (req: DeleteSessionRequest) => deleteSession(req),
    onSuccess: (_data, _vars, _result, { client }) => {
      client.invalidateQueries({ queryKey: ["sessions"] });
    }
  });
}