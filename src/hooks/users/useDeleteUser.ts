import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserDoc } from "@/data/firestore/users";
import useNotifications from "@/features/notifications/useNotifications";

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: (id: number) => deleteUserDoc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User deleted successfully!");
    },
    onError: (err: Error) => {
      error(err?.message || "Failed to delete user.");
    },
  });
}
