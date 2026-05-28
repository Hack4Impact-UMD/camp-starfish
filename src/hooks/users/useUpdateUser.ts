import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateData } from "firebase/firestore";
import { updateUserDoc } from "@/data/firestore/users";
import { UserDoc } from "@/data/firestore/types/documents";
import useNotifications from "@/features/notifications/useNotifications";

interface UpdateUserVariables {
  id: number;
  updates: UpdateData<UserDoc>;
}

export default function useUpdateUser() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: ({ id, updates }: UpdateUserVariables) => updateUserDoc(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User updated successfully!");
    },
    onError: (err: Error) => {
      error(err?.message || "Failed to update user.");
    },
  });
}
