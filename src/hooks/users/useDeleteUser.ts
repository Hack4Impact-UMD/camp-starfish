import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import useNotifications from "@/features/notifications/useNotifications";

interface DeleteUserRequest {
  userId: number;
}

async function deleteUser(req: DeleteUserRequest) {
  const { userId } = req;
  await httpsCallable(functions, "deleteUserAccount")({ userId });
}

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: (req: DeleteUserRequest) => deleteUser(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User deleted successfully!");
    },
    onError: (err: Error) => {
      error(err?.message || "Failed to delete user.");
    },
  });
}
