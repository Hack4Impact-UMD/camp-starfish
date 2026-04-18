import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSessionDTO, createSession } from '@/data/firestore/sessions';
import useNotifications from '@/features/notifications/useNotifications';

export default function useCreateSession() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();
  return useMutation({
    mutationFn: async (data: CreateSessionDTO) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      success("Session created successfully!");
    },
    onError: (err: Error) => {
      console.error("Error creating session:", err);
      error(err?.message || "Failed to create session.");
    },
  });
}
