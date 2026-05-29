import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import useNotifications from "@/features/notifications/useNotifications";

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    // Deletes the user's Auth account + Firestore record server-side (admin-gated).
    mutationFn: (id: number) => httpsCallable(functions, "deleteUserAccount")({ userId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User deleted successfully!");
    },
    onError: (err: Error) => {
      error(err?.message || "Failed to delete user.");
    },
  });
}
