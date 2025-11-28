import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setSession } from '@/data/firestore/sessions';
import { Session } from '../../types/sessionTypes';
import useNotifications from '@/features/notifications/useNotifications';

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (data: Session) => setSession(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      success("Session created successfully!");
    },

    onError: (err: any) => {
      console.error("Error creating session:", err);
      error(err?.message || "Failed to create session.");
    },
  });
}
