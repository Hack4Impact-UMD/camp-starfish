import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import useNotifications from "@/features/notifications/useNotifications";

interface DeletePersonRequest {
  personId: number;
}

async function deletePerson(req: DeletePersonRequest) {
  const { personId } = req;
  await httpsCallable(functions, "deletePerson")({ personId });
}

export default function useDeletePerson() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: (req: DeletePersonRequest) => deletePerson(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      success("Person deleted successfully!");
    },
    onError: (err: Error) => {
      error(err?.message || "Failed to delete person.");
    },
  });
}
