import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setSession } from '@/data/firestore/sessions';
import { Session } from '../../types/sessionTypes';

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Session) => setSession(data), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      console.error('Error creating session:', error);
    },
  });
}
